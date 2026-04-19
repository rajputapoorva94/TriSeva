from django.urls import include, path
from rest_framework.routers import DefaultRouter
from api.views import ComplaintViewSet, PortalUserLoginView, PortalUserRegisterView

router = DefaultRouter()
router.register(r'complaints', ComplaintViewSet)

urlpatterns = [
    path('auth/register/', PortalUserRegisterView.as_view()),
    path('auth/login/', PortalUserLoginView.as_view()),
    path('', include(router.urls)),
]