from django.contrib import admin
from .models import CompanyProfile, UserProfile, JobSeekerProfile


@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    list_display = (
        'company_name',
        'official_email',
        'phone_number',
        'is_verified',
        'created_at',
    )
    list_filter = ('is_verified', 'created_at')
    search_fields = ('company_name', 'official_email', 'phone_number')
    list_editable = ('is_verified',)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    list_filter = ('role',)
    search_fields = ('user__username', 'user__email')


@admin.register(JobSeekerProfile)
class JobSeekerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'phone_number', 'location')
    search_fields = ('user__username', 'full_name', 'phone_number')