# Generated by Django 3.2.18 on 2023-04-10 15:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('endpoints', '0003_auto_20230405_1509'),
    ]

    operations = [
        migrations.AddField(
            model_name='apirequestlog',
            name='browser_id',
            field=models.CharField(default='', max_length=255),
        ),
        migrations.AddField(
            model_name='apirequestlog',
            name='from_cache',
            field=models.BooleanField(default=False),
        ),
    ]