from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import Location, Room, Device, Component, ComponentVariant, Expendable, DeviceTemplate

admin.site.site_header = _('Administration')
admin.site.site_title = 'Inveroom'
admin.site.register([Location, ComponentVariant, Expendable])


class ComponentInline(admin.TabularInline):
    model = Component
    extra = 0


class DeviceInline(admin.TabularInline):
    fields = [('name', 'sn', 'expendables')]
    model = Device
    extra = 0


@admin.register(Component)
class ComponentAdmin(admin.ModelAdmin):
    list_display = ['device', 'variant', 'sn']


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    fields = [('name', 'location')]
    list_display = ['name', 'location']
    inlines = [DeviceInline]


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    fields = [('name', 'sn'), ('room', 'expendables')]
    list_display = ['name', 'room', 'sn', 'inv']
    inlines = [ComponentInline]


@admin.register(DeviceTemplate)
class DeviceTemplateAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
