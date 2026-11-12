\# CareerConnect â€“ Job Portal \& Smart Resume Management System



\## About the Project



CareerConnect is a web-based job portal designed to connect job seekers with companies. It provides a platform for job seekers to explore job opportunities, manage applications, and maintain their resumes. Companies can register, manage their profiles, and post job vacancies after administrator verification.



\## Technologies Used



\### Frontend

\- React.js

\- Vite

\- JavaScript

\- HTML and CSS



\### Backend

\- Python

\- Django

\- Django REST Framework

\- JWT Authentication



\### Database

\- MySQL



\## Project Structure



```text

CareerConnect/

â”œâ”€â”€ backend/

â”‚   â”œâ”€â”€ accounts/

â”‚   â”œâ”€â”€ config/

â”‚   â”œâ”€â”€ jobs/

â”‚   â”œâ”€â”€ manage.py

â”‚   â”œâ”€â”€ requirements.txt

â”‚   â””â”€â”€ .env.example

â”‚

â”œâ”€â”€ frontend/

â”‚   â”œâ”€â”€ public/

â”‚   â”œâ”€â”€ src/

â”‚   â”œâ”€â”€ package.json

â”‚   â””â”€â”€ vite.config.js

â”‚

â”œâ”€â”€ .gitignore

â””â”€â”€ README.md

```



\## Setup Instructions



\### 1. Clone the Repository



```bash

git clone YOUR\_GITHUB\_REPOSITORY\_URL

cd CareerConnect

```



\### 2. Backend Setup



```bash

cd backend

python -m venv venv

```



Activate the virtual environment on Windows:



```bash

venv\\Scripts\\activate

```



Install dependencies:



```bash

pip install -r requirements.txt

```



Create your `.env` file using `.env.example` as a reference and configure your local MySQL database credentials.



Run migrations:



```bash

python manage.py migrate

```



Start the backend:



```bash

python manage.py runserver

```



\### 3. Frontend Setup



Open another terminal:



```bash

cd frontend

npm install

npm run dev

```



\## Security



\- Never upload `.env` files.

\- Never expose database passwords or Django secret keys.

\- Configure your own local environment variables before running the application.



\## Project Status



Under development.
