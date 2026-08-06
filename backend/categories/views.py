from rest_framework import viewsets, permissions
from .models import Category
from .serializers import CategorySerializer

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        workspace_id = self.request.query_params.get('workspace')
        qs = Category.objects.all()
        if workspace_id:
            qs = qs.filter(workspace_id=workspace_id)
        return qs