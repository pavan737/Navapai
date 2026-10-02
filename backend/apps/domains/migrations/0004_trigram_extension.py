from django.db import migrations
from django.contrib.postgres.operations import TrigramExtension, BtreeGinExtension


class Migration(migrations.Migration):

    dependencies = [
        ('domains', '0003_userdomain'),
    ]

    operations = [
        TrigramExtension(),
        BtreeGinExtension(),
    ]
