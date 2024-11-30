# Generated by Django 5.1.1 on 2024-11-30 10:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workspace', '0012_alter_option_options_alter_question_options'),
    ]

    operations = [
        migrations.AlterField(
            model_name='quiz',
            name='interface',
            field=models.CharField(choices=[('DEFAULT', 'Quizzes'), ('COOL_CARD', 'Cool card'), ('MAZE', 'Maze')], default='DEFAULT', max_length=128, verbose_name='Interface'),
        ),
    ]