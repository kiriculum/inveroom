from rest_framework import viewsets

from .serializers import CommonSerializers


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
    DeviceViewSet = CommonSerializers.DeviceSerializer
    ComponentViewSet = CommonSerializers.ComponentSerializer
    ComponentVariantViewSet = CommonSerializers.ComponentVariantSerializer
    ExpandableViewSet = CommonSerializers.ExpendableSerializer
    DeviceTemplateViewSet = CommonSerializers.DeviceTemplateSerializer
