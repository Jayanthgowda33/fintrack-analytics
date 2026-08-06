from rest_framework import serializers
from .models import Transaction, RecurringRule

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'workspace', 'user', 'category', 'amount', 'type', 'note', 'date', 'is_recurring', 'created_at']
        read_only_fields = ['user', 'created_at']


class RecurringRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecurringRule
        fields = ['id', 'transaction_template', 'frequency', 'next_run_date', 'active']