from django.urls import path
from . import views

urlpatterns = [
    path('apply/', views.RetailerApplyView.as_view(), name='retailer-apply'),
    path('status/', views.RetailerStatusView.as_view(), name='retailer-status'),
    # Admin
    path('admin/pending/', views.RetailerApprovalListView.as_view(), name='retailer-pending'),
    path('admin/approve/<int:pk>/', views.RetailerApproveView.as_view(), name='retailer-approve'),
]
