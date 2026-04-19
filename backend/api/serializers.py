import re

from rest_framework import serializers
from .models import Complaint, ComplaintAttachment, PortalUser


class ComplaintAttachmentSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ComplaintAttachment
        fields = ["id", "url", "uploaded_at"]

    def get_url(self, obj):
        request = self.context.get("request")
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        if obj.file:
            return obj.file.url
        return ""

class ComplaintSerializer(serializers.ModelSerializer):
    attachments = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False,
    )
    attachment_files = ComplaintAttachmentSerializer(
        many=True,
        read_only=True,
        source="attachments",
    )

    class Meta:
        model = Complaint
        fields = [
            "id",
            "case_number",
            "title",
            "description",
            "case_type",
            "priority",
            "department",
            "status",
            "citizen_id",
            "citizen_name",
            "citizen_email",
            "sla_deadline",
            "created_at",
            "updated_at",
            "attachments",
            "attachment_files",
        ]
        read_only_fields = [
            "id",
            "case_number",
            "status",
            "sla_deadline",
            "created_at",
            "updated_at",
            "attachment_files",
        ]

    def create(self, validated_data):
        attachments = validated_data.pop("attachments", [])
        complaint = super().create(validated_data)

        for file_obj in attachments:
            ComplaintAttachment.objects.create(complaint=complaint, file=file_obj)

        return complaint


class PortalUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = PortalUser
        fields = [
            "id",
            "name",
            "email",
            "national_id_type",
            "national_id",
            "password",
            "role",
            "created_at",
        ]
        read_only_fields = ["id", "role", "created_at"]

    def validate_email(self, value):
        if not re.match(r"^[A-Za-z0-9]+@xyz\.com$", value):
            raise serializers.ValidationError(
                "Email must be in the format alphanumeric@xyz.com"
            )
        return value

    def validate(self, attrs):
        national_id_type = attrs.get("national_id_type", "AADHAR")
        national_id = attrs.get("national_id", "")

        if national_id_type == "AADHAR":
            if not national_id.isdigit():
                raise serializers.ValidationError(
                    {"national_id": "Aadhaar must contain only digits."}
                )
            if len(national_id) != 16:
                raise serializers.ValidationError(
                    {"national_id": "Aadhaar number must be 16 digits."}
                )
        elif national_id_type == "PAN":
            if not national_id.isalnum():
                raise serializers.ValidationError(
                    {"national_id": "PAN must be alphanumeric."}
                )
            if len(national_id) != 10:
                raise serializers.ValidationError(
                    {"national_id": "PAN number must be 10 characters."}
                )
            attrs["national_id"] = national_id.upper()

        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = PortalUser(**validated_data)
        user.set_password(password)
        user.save()
        return user


class PortalUserLoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField()