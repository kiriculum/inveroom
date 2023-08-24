FROM python:alpine

ARG DJANGO_SECRET
ARG FRONTEND_HOST

RUN apk add --no-cache gcc musl-dev python3-dev libpq-dev gettext
RUN pip install --upgrade pip


RUN adduser -D inveroom
WORKDIR /home/inveroom/app

COPY ./requirements.txt .
RUN pip install --no-cache -r requirements.txt

#USER inveroom
COPY . .

RUN python manage.py collectstatic --noinput
RUN python manage.py compilemessages

USER inveroom

# entrypoint
CMD ["uvicorn", "--host", "0.0.0.0", "--port", "8000", "inveroom.asgi:application"]