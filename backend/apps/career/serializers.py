from rest_framework import serializers
from .models import Certification, CareerMilestone


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = [
            "id",
            "title",
            "issuing_organization",
            "issue_date",
            "expiration_date",
            "credential_id",
            "credential_url",
            "badge_icon_url",
            "is_verified",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["user"] = user
        return super().create(validated_data)


class CareerMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerMilestone
        fields = [
            "id",
            "title",
            "company_or_org",
            "milestone_type",
            "date_achieved",
            "description",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["user"] = user
        return super().create(validated_data)
