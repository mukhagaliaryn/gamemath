# Generated by Django 5.1.1 on 2024-12-25 06:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workspace', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='interface',
            name='order',
            field=models.PositiveSmallIntegerField(default=0, verbose_name='Реттілік номері'),
        ),
    ]