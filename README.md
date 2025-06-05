# Mail Service App

This is a single-page mail service application built using Django, JavaScript, HTML, and CSS. The app allows users to compose and send emails to multiple recipients, view their inbox, archive emails, and reply to received emails seamlessly — all without reloading the page or changing the URL.

## Features

- **Single-page app:** All actions happen within a single page for a smooth experience.
- **Compose and send emails:** Users can send emails to multiple recipients at once.
- **Inbox and archive management:** Easily browse received emails and archive them when needed.
- **Reply to emails:** Quickly respond to any email right from the inbox.
- **Dynamic updates:** The interface updates in real-time without refreshing the page.

## Technologies Used

- **Backend:** Django
- **Frontend:** JavaScript, HTML, CSS
- **AJAX:** For seamless dynamic updates.

## Setup Instructions

1. **Clone the repository:**
   ````bash
   git clone https://github.com/metaamiri/mail-service.git
   cd mail-service
   ````
2. **install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Run database migrations:**
   ```bash
   python manage.py migrate
   ```
4. **Create a superuser (optional, for admin access):**

   ```bash
   python manage.py createsuperuser
   ```

5. **Start the development server:**
   ```bash
   python manage.py runserver
   ```
6. **Access the app:**
   Open http://127.0.0.1:8000 in your browser.

## Project Structure

- **Django Views & Models:** Handles data operations and API endpoints.

- **Static Files (JS, CSS):** For interactivity and styling.

- **Templates:** HTML templates for rendering the frontend.

- **AJAX Calls:** Fetches and sends data without reloading the page.
