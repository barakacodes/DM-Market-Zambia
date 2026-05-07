import random
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

@shared_task
def send_verification_email(email, code):
    subject = 'DM Market Zambia - Verify your email'
    message = f'Your verification code is: {code}'
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
