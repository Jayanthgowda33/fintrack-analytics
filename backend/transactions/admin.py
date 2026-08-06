from django.contrib import admin
from .models import Transaction, RecurringRule

admin.site.register(Transaction)
admin.site.register(RecurringRule)