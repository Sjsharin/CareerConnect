
from django.urls import path

from .views import (
    RegistrationAPIView,
    LoginAPIView,
    JobSeekerProfileAPIView,
    AdminDashboardAPIView,
    AdminCompanyVerificationAPIView
)

urlpatterns = [
    path('register/', RegistrationAPIView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),

    path(
        'job-seeker/profile/',
        JobSeekerProfileAPIView.as_view(),
        name='job-seeker-profile'
    ),

    path(
        'admin/dashboard/',
        AdminDashboardAPIView.as_view(),
        name='admin-dashboard'
    ),

    path(
        'admin/companies/<int:company_id>/verification/',
        AdminCompanyVerificationAPIView.as_view(),
        name='admin-company-verification'
    ),
]
