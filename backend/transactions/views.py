from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import models
from django.db.models import Sum
from .models import Transaction, RecurringRule
from .serializers import TransactionSerializer, RecurringRuleSerializer
import pandas as pd
from rest_framework.parsers import MultiPartParser
from rest_framework.views import APIView
from categories.models import Category
from workspaces.models import Workspace


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Transaction.objects.filter(user=self.request.user)
        category = self.request.query_params.get('category')
        type_ = self.request.query_params.get('type')
        date_from = self.request.query_params.get('from')
        date_to = self.request.query_params.get('to')
        if category:
            qs = qs.filter(category_id=category)
        if type_:
            qs = qs.filter(type=type_)
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RecurringRuleViewSet(viewsets.ModelViewSet):
    serializer_class = RecurringRuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = RecurringRule.objects.all()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_summary(request):
    qs = Transaction.objects.filter(user=request.user)
    income = qs.filter(type='income').aggregate(total=Sum('amount'))['total'] or 0
    expense = qs.filter(type='expense').aggregate(total=Sum('amount'))['total'] or 0
    by_category = qs.filter(type='expense').values('category__name').annotate(total=Sum('amount'))

    return Response({
        'income': income,
        'expense': expense,
        'balance': income - expense,
        'by_category': list(by_category)
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_trend(request):
    qs = Transaction.objects.filter(user=request.user)
    trend = qs.values('date').annotate(
        income=Sum('amount', filter=models.Q(type='income')),
        expense=Sum('amount', filter=models.Q(type='expense'))
    ).order_by('date')
    return Response(list(trend))

class UploadTransactionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get('file')
        workspace_id = request.data.get('workspace')

        if not file:
            return Response({'error': 'No file uploaded'}, status=400)
        if not workspace_id:
            return Response({'error': 'workspace is required'}, status=400)

        try:
            workspace = Workspace.objects.get(id=workspace_id, owner=request.user)
        except Workspace.DoesNotExist:
            return Response({'error': 'Invalid workspace'}, status=400)

        try:
            if file.name.endswith('.csv'):
                df = pd.read_csv(file)
            else:
                df = pd.read_excel(file)
        except Exception as e:
            return Response({'error': f'Could not read file: {str(e)}'}, status=400)

        df.columns = [c.strip().lower() for c in df.columns]
        required_cols = {'date', 'amount', 'type'}
        if not required_cols.issubset(set(df.columns)):
            return Response(
                {'error': f'File must contain columns: {required_cols}. Found: {list(df.columns)}'},
                status=400
            )

        created_count = 0
        errors = []
        category_cache = {}

        transactions_to_create = []

        for index, row in df.iterrows():
            try:
                date_val = pd.to_datetime(row['date']).date()
                amount_val = float(row['amount'])
                type_val = str(row['type']).strip().lower()

                if type_val not in ('income', 'expense'):
                    errors.append(f"Row {index + 2}: invalid type '{type_val}'")
                    continue

                category_obj = None
                category_name = str(row.get('category', '')).strip()
                if category_name and category_name.lower() != 'nan':
                    cache_key = category_name.lower()
                    if cache_key not in category_cache:
                        category_obj, _ = Category.objects.get_or_create(
                            workspace=workspace,
                            name=category_name,
                            type=type_val,
                            defaults={'color': '#3498db'}
                        )
                        category_cache[cache_key] = category_obj
                    else:
                        category_obj = category_cache[cache_key]

                note_val = str(row.get('note', '')).strip()
                if note_val.lower() == 'nan':
                    note_val = ''

                transactions_to_create.append(Transaction(
                    workspace=workspace,
                    user=request.user,
                    category=category_obj,
                    amount=amount_val,
                    type=type_val,
                    note=note_val,
                    date=date_val,
                ))
                created_count += 1

            except Exception as e:
                errors.append(f"Row {index + 2}: {str(e)}")

        Transaction.objects.bulk_create(transactions_to_create, batch_size=500)

        return Response({
            'created': created_count,
            'errors': errors[:20],
            'total_errors': len(errors),
        }, status=201)