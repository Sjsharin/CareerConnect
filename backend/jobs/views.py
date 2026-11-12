
from rest_framework import generics
from rest_framework.permissions import (
    IsAuthenticatedOrReadOnly,
    IsAuthenticated,
)
from rest_framework.exceptions import (
    PermissionDenied,
    NotFound,
    ValidationError,
)

from .models import Job, JobApplication

from .serializers import (
    JobSerializer,
    JobApplicationSerializer,
    CompanyApplicantSerializer,
    CompanyApplicantStatusSerializer,
)

from .permissions import IsVerifiedCompany


# 1. List all jobs and allow verified companies to post jobs
class JobListCreateAPIView(generics.ListCreateAPIView):
    queryset = Job.objects.all().order_by('-created_at')
    serializer_class = JobSerializer

    permission_classes = [
        IsAuthenticatedOrReadOnly,
        IsVerifiedCompany,
    ]

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)


# 2. Display jobs posted by the logged-in company
class CompanyJobsAPIView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if (
            not hasattr(user, 'profile')
            or user.profile.role != 'company'
        ):
            raise PermissionDenied(
                'Only companies can view their posted jobs.'
            )

        return Job.objects.filter(
            posted_by=user
        ).order_by('-created_at')


# 3. Allow job seekers to apply for jobs
class JobApplicationCreateAPIView(generics.CreateAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user

        if (
            not hasattr(user, 'profile')
            or user.profile.role != 'job_seeker'
        ):
            raise PermissionDenied(
                'Only job seekers can apply for jobs.'
            )

        job_id = self.kwargs.get('job_id')

        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            raise NotFound('Job not found.')

        already_applied = JobApplication.objects.filter(
            job=job,
            applicant=user
        ).exists()

        if already_applied:
            raise ValidationError(
                'You have already applied for this job.'
            )

        serializer.save(
            applicant=user,
            job=job
        )


# 4. Display applications submitted by the logged-in job seeker
class MyJobApplicationsAPIView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if (
            not hasattr(user, 'profile')
            or user.profile.role != 'job_seeker'
        ):
            raise PermissionDenied(
                'Only job seekers can view their applications.'
            )

        return JobApplication.objects.filter(
            applicant=user
        ).select_related(
            'job'
        ).order_by('-applied_at')


# 5. Allow companies to view applicants for their own jobs
class CompanyApplicantsAPIView(generics.ListAPIView):
    serializer_class = CompanyApplicantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        job_id = self.kwargs.get('job_id')

        if (
            not hasattr(user, 'profile')
            or user.profile.role != 'company'
        ):
            raise PermissionDenied(
                'Only companies can view applicants.'
            )

        try:
            job = Job.objects.get(
                id=job_id,
                posted_by=user
            )
        except Job.DoesNotExist:
            raise NotFound(
                'Job not found or you do not own this job.'
            )

        return JobApplication.objects.filter(
            job=job
        ).select_related(
            'applicant',
            'job'
        ).order_by('-applied_at')


# 6. Allow companies to update applicant status
class CompanyApplicantStatusUpdateAPIView(generics.UpdateAPIView):
    serializer_class = CompanyApplicantStatusSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['patch', 'options', 'head']

    def get_object(self):
        user = self.request.user

        if (
            not hasattr(user, 'profile')
            or user.profile.role != 'company'
        ):
            raise PermissionDenied(
                'Only companies can update applicant status.'
            )

        job_id = self.kwargs.get('job_id')
        application_id = self.kwargs.get('application_id')

        try:
            job = Job.objects.get(
                id=job_id,
                posted_by=user
            )
        except Job.DoesNotExist:
            raise NotFound(
                'Job not found or you do not own this job.'
            )

        try:
            application = JobApplication.objects.get(
                id=application_id,
                job=job
            )
        except JobApplication.DoesNotExist:
            raise NotFound(
                'Application not found for this job.'
            )

        return application
