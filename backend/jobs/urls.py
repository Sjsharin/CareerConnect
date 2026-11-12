
from django.urls import path

from .views import (
    JobListCreateAPIView,
    CompanyJobsAPIView,
    JobApplicationCreateAPIView,
    MyJobApplicationsAPIView,
    CompanyApplicantsAPIView,
    CompanyApplicantStatusUpdateAPIView,
)

urlpatterns = [
    path(
        'jobs/',
        JobListCreateAPIView.as_view(),
        name='job-list'
    ),

    path(
        'company/jobs/',
        CompanyJobsAPIView.as_view(),
        name='company-jobs'
    ),

    path(
        'company/jobs/<int:job_id>/applicants/',
        CompanyApplicantsAPIView.as_view(),
        name='company-applicants'
    ),

    path(
        'company/jobs/<int:job_id>/applicants/<int:application_id>/status/',
        CompanyApplicantStatusUpdateAPIView.as_view(),
        name='company-applicant-status'
    ),

    path(
        'jobs/<int:job_id>/apply/',
        JobApplicationCreateAPIView.as_view(),
        name='job-apply'
    ),

    path(
        'my-applications/',
        MyJobApplicationsAPIView.as_view(),
        name='my-applications'
    ),
]
