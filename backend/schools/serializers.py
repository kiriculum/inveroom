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
    ExpendableSerializer = Expendable
    DeviceTemplateSerializer = DeviceTemplate


class ComponentVariantSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    def create(self, validated_data):
        validated_data.pop('id', None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('id', None)
        return super().update(instance, validated_data)

    class Meta:
        model = ComponentVariant
        fields = "__all__"


class ComponentSerializer(serializers.ModelSerializer):
    variant = ComponentVariantSerializer()

    def create(self, validated_data):
        variant_data: dict = validated_data.pop('variant')
        variant_id = variant_data.get('id', None)
        if variant_id:
            variant = ComponentVariant.objects.get(pk=variant_id)
        else:
            variant = ComponentVariant.objects.create(**variant_data)
        return Component.objects.create(variant=variant, **validated_data)

    def update(self, instance, validated_data):
        variant_data: dict = validated_data.pop('variant')
        variant_id = variant_data.get('id', None)
        if variant_id:
            variant = ComponentVariant.objects.get(pk=variant_id)
        else:
            variant = ComponentVariant.objects.create(**variant_data)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        setattr(instance, 'variant', variant)
        instance.save()
        return instance

    class Meta:
        model = Component
        fields = '__all__'
