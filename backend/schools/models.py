from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')


class NamedModel(models.Model):
    name = models.TextField(_('name'), max_length=256, blank=True, default='')

    def __str__(self):
        return self.name

    class Meta:
        abstract = True


class LocationManager(models.Manager):
    def top_locations(self):
        return self.filter(up_loc=None)


class Location(NamedModel):
    address = models.TextField(_('address'), max_length=256, blank=True, default="")
    up_loc = models.ForeignKey('self', related_name='sub_deps', blank=True, null=True, on_delete=models.CASCADE)

    objects = LocationManager()

    def clean(self):
        if self.up_loc and self.pk == self.up_loc.pk:
            raise ValidationError(_('Location can not be a sublocation to itself'))

    class Meta:
        verbose_name = _('Location')
        verbose_name_plural = _('Locations')


class Room(NamedModel):
    location = models.ForeignKey('Location', related_name='rooms', on_delete=models.CASCADE)

    class Meta:
        verbose_name = _('Room')
        verbose_name_plural = _('Rooms')


class Device(NamedModel):
    expendables = models.ManyToManyField('Expendable', blank=True, verbose_name=_('Expendables'),
                                         related_name='devices')
    room = models.ForeignKey('Room', related_name='devices', verbose_name=_('Room'), on_delete=models.CASCADE)
    sn = models.TextField('SN', max_length=256, blank=True, default="")
    inv = models.TextField('INV', max_length=256, blank=True, default="")

    class Meta:
        verbose_name = _('Device')
        verbose_name_plural = _('Devices')


class DeviceTemplate(models.Model):
    name = models.TextField(_('name'), blank=True, default='', max_length=256)
    expendables = models.ManyToManyField('Expendable', blank=True, verbose_name=_('Expendables'),
                                         related_name='templates')
    components = models.ManyToManyField('ComponentVariant', blank=True, verbose_name=_('Components'),
                                        related_name='templates')

    class Meta:
        verbose_name = _('Device template')
        verbose_name_plural = _('Device templates')


class Component(models.Model):
    device = models.ForeignKey('device', related_name='components', on_delete=models.CASCADE)
    variant = models.ForeignKey('ComponentVariant', related_name='components', null=True, on_delete=models.SET_NULL)
    sn = models.TextField('SN', max_length=256, blank=True, default="")

    def __str__(self):
        return self.variant.name if self.variant else self.sn

    class Meta:
        verbose_name = _('Component')
        verbose_name_plural = _('Components')


class ComponentVariant(NamedModel):
    image = models.ImageField(upload_to='images/components', blank=True, null=True)

    class Meta:
        verbose_name = _('Component type')
        verbose_name_plural = _('Component types')


class Expendable(NamedModel):
    class Meta:
        verbose_name = _('Expendable')
        verbose_name_plural = _('Expendables')
