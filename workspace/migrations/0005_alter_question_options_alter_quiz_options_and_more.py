# Generated by Django 5.1.1 on 2024-12-25 06:46

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('workspace', '0004_option_order_question_order_quiz_order'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='question',
            options={'ordering': ('order',), 'verbose_name': 'Сұрақ', 'verbose_name_plural': 'Сұрақтар'},
        ),
        migrations.AlterModelOptions(
            name='quiz',
            options={'ordering': ('order',), 'verbose_name': 'Ойын тесті', 'verbose_name_plural': 'Ойын тесттері'},
        ),
        migrations.RemoveField(
            model_name='option',
            name='order',
        ),
    ]
