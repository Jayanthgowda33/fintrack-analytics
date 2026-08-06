from rest_framework import generics, permissions
from django.contrib.auth.models import User
from rest_framework.serializers import ModelSerializer
from workspaces.models import Workspace, WorkspaceMember

class RegisterSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        # Auto-create a default workspace for this user
        workspace = Workspace.objects.create(name=f"{user.username}'s Workspace", owner=user)
        WorkspaceMember.objects.create(workspace=workspace, user=user, role='owner')
        return user


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]