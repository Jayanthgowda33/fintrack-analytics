from django.db import models
from workspaces.models import Workspace

class Category(models.Model):
    TYPE_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    color = models.CharField(max_length=20, default='#3498db')

    def __str__(self):
        return f"{self.name} ({self.type})"