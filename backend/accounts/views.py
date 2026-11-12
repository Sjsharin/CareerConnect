
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import PermissionDenied, NotFound

from django.contrib.auth.models import User

from .serializers import (
    RegistrationSerializer,
    LoginSerializer,
    JobSeekerProfileSerializer
)

from .models import (
    UserProfile,
    CompanyProfile,
    JobSeekerProfile
)

from jobs.models import Job, JobApplication


class RegistrationAPIView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.AllowAny]


class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)

        if user.is_staff and user.is_superuser:
            user_role = 'admin'
        else:
            user_role = user_profile_role(user)

        return Response({
            'message': 'Login successful.',
            'username': user.username,
            'role': user_role,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)


class JobSeekerProfileAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = JobSeekerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        if user_profile_role(self.request.user) != 'job_seeker':
            raise PermissionDenied(
                'Only job seekers can access this profile.'
            )

        try:
            return JobSeekerProfile.objects.get(
                user=self.request.user
            )
        except JobSeekerProfile.DoesNotExist:
            raise NotFound('Job seeker profile not found.')


class AdminDashboardAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):

        if not request.user.is_staff or not request.user.is_superuser:
            raise PermissionDenied(
                'Only administrators can access this dashboard.'
            )

        companies = CompanyProfile.objects.select_related('user').all()

        company_data = []

        for company in companies:
            company_data.append({
                'id': company.id,
                'company_name': company.company_name,
                'username': company.user.username,
                'official_email': company.official_email,
                'phone_number': company.phone_number,
                'is_verified': company.is_verified,
                'created_at': company.created_at,
            })

        return Response({
            'total_users': User.objects.count(),
            'total_job_seekers': UserProfile.objects.filter(
                role='job_seeker'
            ).count(),
            'total_companies': CompanyProfile.objects.count(),
            'verified_companies': CompanyProfile.objects.filter(
                is_verified=True
            ).count(),
            'pending_companies': CompanyProfile.objects.filter(
                is_verified=False
            ).count(),
            'total_jobs': Job.objects.count(),
            'total_applications': JobApplication.objects.count(),
            'companies': company_data,
        })


def user_profile_role(user):
    try:
        return user.profile.role
    except Exception:
        return None

class AdminCompanyVerificationAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, company_id):

        if not request.user.is_staff or not request.user.is_superuser:
            raise PermissionDenied(
                'Only administrators can verify companies.'
            )

        is_verified = request.data.get('is_verified')

        if not isinstance(is_verified, bool):
            return Response(
                {'detail': 'is_verified must be true or false.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            company = CompanyProfile.objects.get(id=company_id)
        except CompanyProfile.DoesNotExist:
            raise NotFound('Company not found.')

        company.is_verified = is_verified
        company.save(update_fields=['is_verified'])

        return Response({
            'message': (
                'Company verified successfully.'
                if is_verified
                else 'Company verification revoked.'
            ),
            'company_id': company.id,
            'company_name': company.company_name,
            'is_verified': company.is_verified,
        })
