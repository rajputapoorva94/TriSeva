from datetime import timedelta
import secrets

from django.contrib.auth.hashers import check_password, make_password
from django.core.validators import RegexValidator

from django.db import models
from django.utils import timezone

class Complaint(models.Model):
    CASE_TYPES = [
        ("ADMINISTRATIVE", "Administrative"),
        ("JUDICIAL", "Judicial"),
        ("LEGISLATIVE", "Legislative"),
    ]

    PRIORITIES = [
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
        ("URGENT", "Urgent"),
    ]

    STATUSES = [
        ("SUBMITTED", "Submitted"),
        ("UNDER_REVIEW", "Under Review"),
        ("PENDING_INFO", "Pending Info"),
        ("ESCALATED", "Escalated"),
        ("RESOLVED", "Resolved"),
        ("CLOSED", "Closed"),
        ("REJECTED", "Rejected"),
    ]

    case_number = models.CharField(max_length=30, unique=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    case_type = models.CharField(max_length=20, choices=CASE_TYPES)
    priority = models.CharField(max_length=10, choices=PRIORITIES, default="MEDIUM")
    department = models.CharField(max_length=120)
    status = models.CharField(max_length=20, choices=STATUSES, default="SUBMITTED")
    citizen_id = models.CharField(max_length=50)
    citizen_name = models.CharField(max_length=120)
    citizen_email = models.EmailField()
    sla_deadline = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.case_number} - {self.title}"

    def save(self, *args, **kwargs):
        if not self.case_number:
            self.case_number = self._generate_case_number()
        if not self.sla_deadline:
            self.sla_deadline = self._calculate_sla_deadline()
        super().save(*args, **kwargs)

    def _generate_case_number(self):
        prefix = "GRV"
        if self.case_type == "JUDICIAL":
            prefix = "JUD"
        elif self.case_type == "LEGISLATIVE":
            prefix = "LEG"

        year = timezone.now().year
        for _ in range(5):
            random_part = secrets.randbelow(900000) + 100000
            candidate = f"{prefix}-{year}-{random_part}"
            if not Complaint.objects.filter(case_number=candidate).exists():
                return candidate

        return f"{prefix}-{year}-{secrets.token_hex(4)}"

    def _calculate_sla_deadline(self):
        sla_hours = {
            "URGENT": 48,
            "HIGH": 72,
            "MEDIUM": 120,
            "LOW": 168,
        }
        hours = sla_hours.get(self.priority, 120)
        return timezone.now() + timedelta(hours=hours)


class ComplaintAttachment(models.Model):
    complaint = models.ForeignKey(
        Complaint,
        on_delete=models.CASCADE,
        related_name="attachments",
    )
    file = models.FileField(upload_to="complaints/%Y/%m/%d/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment for {self.complaint_id}"


class PortalUser(models.Model):
    ROLE_CHOICES = [
        ("CITIZEN", "Citizen"),
        ("OFFICER", "Officer"),
        ("SENIOR_OFFICER", "Senior Officer"),
        ("DEPT_HEAD", "Department Head"),
        ("ADMIN", "Administrator"),
    ]

    ID_TYPE_CHOICES = [
        ("AADHAR", "Aadhaar"),
        ("PAN", "PAN"),
    ]

    national_id_validator = RegexValidator(
        regex=r"^(\d{16}|[A-Za-z0-9]{10})$",
        message="National ID must be 16 digits (Aadhaar) or 10 alphanumeric characters (PAN)",
    )

    name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    national_id_type = models.CharField(max_length=10, choices=ID_TYPE_CHOICES, default="AADHAR")
    national_id = models.CharField(max_length=20, unique=True, validators=[national_id_validator])
    password_hash = models.CharField(max_length=128)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="CITIZEN")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.email})"

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)
