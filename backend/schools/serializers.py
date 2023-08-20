from rest_framework import serializers

from .models import Location, Room, Device, Component, ComponentVariant, Expendable, DeviceTemplate


class CommonSerializerMeta(type):
    def __new__(mcs, name, bases, attrs: dict[str, any]):
        fields = {}
        items = [(field, model) for field, model in attrs.items() if not field.startswith('__')]
        for field, model in items:
            meta = type('Meta', (), {'model': model, 'fields': '__all__'})
            fields[field] = type(field, (serializers.ModelSerializer,), {'Meta': meta})
        return super().__new__(mcs, name, bases, fields)


class CommonSerializers(metaclass=CommonSerializerMeta):
    LocationSerializer = Location
    RoomSerializer = Room
    DeviceSerializer = Device
    ComponentSerializer = Component
    ComponentVariantSerializer = ComponentVariant
    ExpendableSerializer = Expendable
    DeviceTemplateSerializer = DeviceTemplate
