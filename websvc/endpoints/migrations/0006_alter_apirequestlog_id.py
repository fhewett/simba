# Generated by Django 4.2.9 on 2024-02-05 20:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('endpoints', '0005_alter_apirequestlog_duration'),
    ]

    operations = [
        migrations.AlterField(
            model_name='apirequestlog',
            name='id',
            field=models.CharField(max_length=40, primary_key=True, serialize=False),
        ),
    ]
