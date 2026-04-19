from django.db.models import Q
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from .models import Complaint, PortalUser
from .serializers import ComplaintSerializer, PortalUserLoginSerializer, PortalUserSerializer

class ComplaintViewSet(ModelViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    parser_classes = [MultiPartParser, FormParser]


class PortalUserRegisterView(APIView):
    def post(self, request):
        serializer = PortalUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(PortalUserSerializer(user).data, status=status.HTTP_201_CREATED)


class PortalUserLoginView(APIView):
    def post(self, request):
        serializer = PortalUserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        identifier = serializer.validated_data["identifier"]
        password = serializer.validated_data["password"]

        user = PortalUser.objects.filter(
            Q(email=identifier) | Q(national_id=identifier)
        ).first()

        if not user or not user.check_password(password):
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.is_active:
            return Response(
                {"detail": "Account is inactive"},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(PortalUserSerializer(user).data)
