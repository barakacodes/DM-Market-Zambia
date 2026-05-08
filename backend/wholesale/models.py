from django.db import models
from django.conf import settings

class RetailerProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='retailer_profile')
    business_name = models.CharField(max_length=200)
    business_address = models.TextField()
    tax_id = models.CharField(max_length=50, blank=True)
    is_approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Retailer: {self.business_name} ({self.user.email})"
