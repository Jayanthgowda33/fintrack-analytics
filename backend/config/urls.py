from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from workspaces.views import WorkspaceViewSet, WorkspaceMemberViewSet
from categories.views import CategoryViewSet
from transactions.views import (
    TransactionViewSet, RecurringRuleViewSet,
    dashboard_summary, dashboard_trend, UploadTransactionsView
)

router = DefaultRouter()
router.register('workspaces', WorkspaceViewSet, basename='workspace')
router.register('workspace-members', WorkspaceMemberViewSet, basename='workspacemember')
router.register('categories', CategoryViewSet, basename='category')
router.register('transactions', TransactionViewSet, basename='transaction')
router.register('recurring-rules', RecurringRuleViewSet, basename='recurringrule')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', TokenObtainPairView.as_view()),
    path('api/auth/refresh/', TokenRefreshView.as_view()),
    path('api/auth/', include('users.urls')),
    path('api/dashboard/summary/', dashboard_summary),
    path('api/dashboard/trend/', dashboard_trend),

    # IMPORTANT: this must come BEFORE the router include below
    path('api/transactions/upload/', UploadTransactionsView.as_view()),

    path('api/', include(router.urls)),
]