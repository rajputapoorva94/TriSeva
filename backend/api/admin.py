from django.contrib import admin
from .models import Complaint, ComplaintAttachment, PortalUser

admin.site.register(Complaint)
admin.site.register(ComplaintAttachment)
admin.site.register(PortalUser)

