# Generated by Django 4.2.11 on 2024-04-25 17:57

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('endpoints', '0009_rename_model_apirequestlog_model_sig_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='apirequestlog',
            name='error',
        ),
    ]