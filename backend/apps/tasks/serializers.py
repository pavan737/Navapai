from rest_framework import serializers
from .models import WeeklyTask, SubTask


class SubTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubTask
        fields = ["id", "title", "is_completed", "created_at"]


class WeeklyTaskListSerializer(serializers.ModelSerializer):
    user_domain_name = serializers.CharField(source="user_domain.original_name", read_only=True, default=None)
    project_title = serializers.CharField(source="project.title", read_only=True, default=None)
    subtasks_count = serializers.IntegerField(source="subtasks.count", read_only=True)
    completed_subtasks_count = serializers.SerializerMethodField()

    class Meta:
        model = WeeklyTask
        fields = [
            "id",
            "title",
            "description",
            "status",

            "priority",
            "category",
            "week_number",
            "year",
            "due_date",
            "completed_at",
            "estimated_minutes",
            "actual_minutes",
            "user_domain",
            "user_domain_name",
            "project",
            "project_title",
            "subtasks_count",
            "completed_subtasks_count",
            "created_at",
            "updated_at",
        ]

    def get_completed_subtasks_count(self, obj) -> int:
        return obj.subtasks.filter(is_completed=True).count()


class WeeklyTaskDetailSerializer(serializers.ModelSerializer):
    subtasks = SubTaskSerializer(many=True, read_only=True)
    user_domain_name = serializers.CharField(source="user_domain.original_name", read_only=True, default=None)
    project_title = serializers.CharField(source="project.title", read_only=True, default=None)

    class Meta:
        model = WeeklyTask
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "category",
            "week_number",
            "year",
            "due_date",
            "completed_at",
            "estimated_minutes",
            "actual_minutes",
            "user_domain",
            "user_domain_name",
            "project",
            "project_title",
            "subtasks",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class WeeklyTaskCreateUpdateSerializer(serializers.ModelSerializer):
    initial_subtasks = serializers.ListField(
        child=serializers.CharField(max_length=255),
        required=False,
        write_only=True,
        default=list,
    )

    class Meta:
        model = WeeklyTask
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "category",
            "week_number",
            "year",
            "due_date",
            "estimated_minutes",
            "actual_minutes",
            "user_domain",
            "project",
            "initial_subtasks",
        ]

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = data.copy()
            if data.get("user_domain") == "":
                data["user_domain"] = None
            if data.get("project") == "":
                data["project"] = None
        return super().to_internal_value(data)

    def create(self, validated_data):
        subtasks_titles = validated_data.pop("initial_subtasks", [])
        user = self.context["request"].user
        validated_data["user"] = user

        task = super().create(validated_data)

        for st_title in subtasks_titles:
            if st_title.strip():
                SubTask.objects.create(task=task, title=st_title.strip())

        return task
