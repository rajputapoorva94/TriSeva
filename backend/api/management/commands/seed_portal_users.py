from django.core.management.base import BaseCommand

from api.models import PortalUser


DEMO_USERS = [
    {
        "name": "Rajesh Kumar",
        "email": "rajesh.kumar@example.com",
        "national_id_type": "AADHAR",
        "national_id": "1234567890123456",
        "role": "CITIZEN",
    },
    {
        "name": "Priya Sharma",
        "email": "priya.sharma@example.com",
        "national_id_type": "AADHAR",
        "national_id": "9876543210123456",
        "role": "CITIZEN",
    },
    {
        "name": "Officer Amit Patel",
        "email": "amit.patel@gov.in",
        "national_id_type": "PAN",
        "national_id": "ABCDE1234F",
        "role": "OFFICER",
    },
    {
        "name": "Senior Officer Sunita Verma",
        "email": "sunita.verma@gov.in",
        "national_id_type": "PAN",
        "national_id": "PQRSX9876Z",
        "role": "SENIOR_OFFICER",
    },
    {
        "name": "Dept Head Vikram Singh",
        "email": "vikram.singh@gov.in",
        "national_id_type": "PAN",
        "national_id": "LMNOP1122Q",
        "role": "DEPT_HEAD",
    },
    {
        "name": "Admin Kavita Reddy",
        "email": "kavita.reddy@gov.in",
        "national_id_type": "PAN",
        "national_id": "TUVWX9988R",
        "role": "ADMIN",
    },
]


class Command(BaseCommand):
    help = "Seed demo portal users with a default password."

    def handle(self, *args, **options):
        created = 0
        updated = 0

        for item in DEMO_USERS:
            user = PortalUser.objects.filter(email=item["email"]).first()
            if not user:
                user = PortalUser.objects.filter(
                    national_id=item["national_id"],
                ).first()

            if user:
                user.name = item["name"]
                user.email = item["email"]
                user.national_id_type = item["national_id_type"]
                user.national_id = item["national_id"]
                user.role = item["role"]
                user.is_active = True
                user.set_password("demo")
                user.save()
                updated += 1
            else:
                user = PortalUser(
                    name=item["name"],
                    email=item["email"],
                    national_id_type=item["national_id_type"],
                    national_id=item["national_id"],
                    role=item["role"],
                    is_active=True,
                )
                user.set_password("demo")
                user.save()
                created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded demo users. Created: {created}, updated: {updated}."
            )
        )
