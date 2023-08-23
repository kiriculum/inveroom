from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Component
from .serializers import CommonSerializers, ComponentSerializer, ComponentVariantSerializer


class CommonViewSetMeta(type):
    def __new__(mcs, name, bases, attrs: dict[str, any]):
        fields = {}
        items = [(field, model) for field, model in attrs.items() if not field.startswith('__')]
        for field, serializer in items:
            fields[field] = type(field, (viewsets.ModelViewSet,),
                                 {'serializer_class': serializer, 'queryset': serializer.Meta.model.objects.all()})
        return super().__new__(mcs, name, bases, fields)


class CommonViewSets(metaclass=CommonViewSetMeta):
    LocationViewSet = CommonSerializers.LocationSerializer
    RoomViewSet = CommonSerializers.RoomSerializer
    ComponentViewSet = ComponentSerializer
    ComponentVariantViewSet = ComponentVariantSerializer
    ExpandableViewSet = CommonSerializers.ExpendableSerializer
    DeviceTemplateViewSet = CommonSerializers.DeviceTemplateSerializer


class DeviceViewSet(viewsets.ModelViewSet):
    queryset = CommonSerializers.DeviceSerializer.Meta.model.objects.all()
    serializer_class = CommonSerializers.DeviceSerializer

    @action(detail=True, methods=['GET'])
    def components(self, _request, pk=None):
        try:
            query = Component.objects.filter(device=pk).order_by('variant__name')
            return Response(ComponentSerializer(query, many=True).data)
        except self.serializer_class.Meta.model.DoesNotExist:
            return Response({'detail': 'No such device'}, status=status.HTTP_400_BAD_REQUEST)
