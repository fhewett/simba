# Generated by Django 4.2.11 on 2024-04-25 16:30

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('endpoints', '0008_rename_meta_url_apirequestlog_meta_data_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='apirequestlog',
            old_name='model',
            new_name='model_sig',
        ),
        migrations.RemoveField(
            model_name='apirequestlog',
            name='model_params',
        ),
    ]
