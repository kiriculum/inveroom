from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CommonViewSets, DeviceViewSet

router = DefaultRouter()
router.register('locations', CommonViewSets.LocationViewSet)
router.register('rooms', CommonViewSets.RoomViewSet)
router.register('devices', DeviceViewSet)
router.register('templates', CommonViewSets.DeviceTemplateViewSet)
router.register('components', CommonViewSets.ComponentViewSet)
router.register('variants', CommonViewSets.ComponentVariantViewSet)
router.register('expendables', CommonViewSets.ExpandableViewSet)

urlpatterns = [path('auth/', include('djoser.urls')),
               path('auth/', include('djoser.urls.jwt')),
               path('', include(router.urls))]
