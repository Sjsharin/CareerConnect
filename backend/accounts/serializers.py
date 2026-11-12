
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (
    CompanyProfile,
    UserProfile,
    JobSeekerProfile
)


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    role = serializers.ChoiceField(
        choices=['job_seeker', 'company'],
        write_only=True
    )

    company_name = serializers.CharField(
        required=False,
        allow_blank=True
    )

    official_email = serializers.EmailField(
        required=False,
        allow_blank=True
    )

    phone_number = serializers.CharField(
        required=False,
        allow_blank=True
    )

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'role',
            'company_name',
            'official_email',
            'phone_number',
        ]

    def validate(self, attrs):
        if User.objects.filter(
            username=attrs['username']
        ).exists():
            raise serializers.ValidationError({
                'username': 'This username is already taken.'
            })

        if User.objects.filter(
            email=attrs['email']
        ).exists():
            raise serializers.ValidationError({
                'email': 'This email is already registered.'
            })

        if attrs['role'] == 'company':
            for field in [
                'company_name',
                'official_email',
                'phone_number',
            ]:
                if not attrs.get(field):
                    raise serializers.ValidationError({
                        field: 'This field is required for company registration.'
                    })

        return attrs

    def create(self, validated_data):
        role = validated_data.pop('role')

        company_name = validated_data.pop(
            'company_name', ''
        )
        official_email = validated_data.pop(
            'official_email', ''
        )
        phone_number = validated_data.pop(
            'phone_number', ''
        )

        user = User.objects.create_user(**validated_data)

        UserProfile.objects.create(
            user=user,
            role=role
        )

        if role == 'company':
            CompanyProfile.objects.create(
                user=user,
                company_name=company_name,
                official_email=official_email,
                phone_number=phone_number,
            )

        elif role == 'job_seeker':
            JobSeekerProfile.objects.create(
                user=user
            )

        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        from django.contrib.auth import authenticate

        user = authenticate(
            username=attrs.get('username'),
            password=attrs.get('password')
        )

        if not user:
            raise serializers.ValidationError(
                'Invalid username or password.'
            )

        if not user.is_active:
            raise serializers.ValidationError(
                'This account is inactive.'
            )

        attrs['user'] = user
        return attrs


class JobSeekerProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = JobSeekerProfile
        fields = [
            'full_name',
            'phone_number',
            'location',
            'profile_summary',
            'skills',
            'education',
            'resume',
        ]
