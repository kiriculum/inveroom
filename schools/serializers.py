from rest_framework import serializers

from .models import Location, Room, Device, Component, ComponentVariant, Expendable, DeviceTemplate


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'


class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = '__all__'


class ComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Component
        fields = '__all__'


class ComponentVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentVariant
        fields = '__all__'


class ExpandableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expendable
        fields = '__all__'


class DeviceTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceTemplate
        fields = '__all__'
