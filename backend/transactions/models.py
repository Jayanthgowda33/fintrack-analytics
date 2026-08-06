from django.db import models
from django.contrib.auth.models import User
from workspaces.models import Workspace
from categories.models import Category

class Transaction(models.Model):
    TYPE_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='transactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    note = models.CharField(max_length=255, blank=True)
    date = models.DateField()
    is_recurring = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.type} - {self.amount} on {self.date}"


class RecurringRule(models.Model):
    FREQUENCY_CHOICES = [
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    transaction_template = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='recurring_rules')
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    next_run_date = models.DateField()
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.frequency} - next: {self.next_run_date}"