# Generated by Django 5.1.1 on 2025-01-24 18:53

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workspace', '0007_quiz_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='interface',
            name='category',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='interfaces', to='workspace.category', verbose_name='Категория'),
        ),
    ]
