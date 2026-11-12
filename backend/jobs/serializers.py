
from rest_framework import serializers
from .models import Job, JobApplication


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ['posted_by']


class JobApplicationSerializer(serializers.ModelSerializer):
    job = serializers.PrimaryKeyRelatedField(read_only=True)

    job_title = serializers.CharField(
        source='job.title',
        read_only=True
    )

    company_name = serializers.CharField(
        source='job.company_name',
        read_only=True
    )

    class Meta:
        model = JobApplication
        fields = [
            'id',
            'job',
            'job_title',
            'company_name',
            'applied_at',
            'status',
        ]
        read_only_fields = [
            'id',
            'job',
            'applied_at',
            'status',
        ]


class CompanyApplicantSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()

    applicant_email = serializers.EmailField(
        source='applicant.email',
        read_only=True
    )

    applicant_username = serializers.CharField(
        source='applicant.username',
        read_only=True
    )

    job_title = serializers.CharField(
        source='job.title',
        read_only=True
    )

    class Meta:
        model = JobApplication
        fields = [
            'id',
            'applicant_name',
            'applicant_username',
            'applicant_email',
            'job_title',
            'applied_at',
            'status',
        ]

    def get_applicant_name(self, obj):
        profile = getattr(
            obj.applicant,
            'jobseekerprofile',
            None
        )

        if profile and profile.full_name:
            return profile.full_name

        return obj.applicant.username


class CompanyApplicantStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['status']

    def validate_status(self, value):
        allowed_statuses = [
            'shortlisted',
            'rejected',
            'accepted',
        ]

        if value not in allowed_statuses:
            raise serializers.ValidationError(
                'Choose Shortlisted, Rejected or Accepted.'
            )

        return value
