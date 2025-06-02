document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector("#email-content").style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  const form = document.querySelector('#compose-form');

  if (!form.hasAttribute("listener-added")) {
    form.addEventListener('submit', (event) => {
      event.preventDefault(); 

      const recipients = document.querySelector('#compose-recipients').value;
      const subject = document.querySelector('#compose-subject').value;
      const body = document.querySelector('#compose-body').value;

      fetch('/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
        })
      })
      .then(response => response.json())
      .then(result => {
        if (result.error) {
          alert("Compose Mail Failed : " + result.error);
        } else {
          load_mailbox('sent'); 
        }
      });
      load_mailbox('sent'); 
    });
    
     form.setAttribute("listener-added", "true");
  }
}

function load_email(email_id){
  // show the email content and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector("#email-content").style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  const view = document.querySelector("#email-content");

  fetch(`/emails/${email_id}`,{
    method:'PUT',
    body : JSON.stringify({
      read:true
    })
  });

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    view.innerHTML ='';

    const emailDiv = document.createElement("div");
    emailDiv.className = "email-item-content";
    emailDiv.style.border = "1px solid #ccc";
    emailDiv.style.padding = "10px";
    emailDiv.style.marginBottom = "10px";
    emailDiv.style.backgroundColor = email.read ? "#f0f0f0" : "white";

    let email_recipients = '';
      let i = (email.recipients.length).valueOf() - 1;
      email.recipients.forEach(recipient =>{
        if(i >= 1){
          email_recipients += recipient+", ";
          
        }
        else{
          email_recipients += recipient;
        }
        i--;
      });

    emailDiv.innerHTML = `
      <strong>From :</strong> ${email.sender} <br>
      <strong>To :</strong> ${email_recipients} <br>
      <strong>Subject:</strong> ${email.subject} <br>
      <p>${email.body}</p>
      <small>${email.timestamp}</small>
    `;

    view.appendChild(emailDiv);
  });
}

function archive_email(email_id, email_archived){
  fetch(`emails/${email_id}`, {
    method : "PUT",
    body : JSON.stringify({
      archived : !(email_archived)
    })
  });
  load_mailbox("inbox");
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector("#email-content").style.display = 'none';

  // Show the mailbox name
  const mailbox_name = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  const view = document.querySelector("#emails-view");
  //----------------------INBOX-------------------
  if (mailbox === "inbox") {
    fetch(`/emails/inbox`)
      .then(response => response.json())
      .then(emails => {
        // پاک‌کردن محتوای قبلی
        
        view.innerHTML = `<h3>${mailbox_name} </ br> </h3>`;
  
        // بررسی اینکه لیست ایمیل‌ها خالی نباشه
        if (emails.length === 0) {
          view.innerHTML += "<p>No Email Has Been Received yet.</p>";
          return;
        }
  
        // ساختن div برای هر ایمیل
        emails.forEach(email => {
          const emailDiv = document.createElement("div");
          const archiveIcon = document.createElement("img");
          const archiveImage = document.querySelector("#archiveImage");

          archiveIcon.className = "inbox-archive-icon";
          archiveIcon.style.width = "20px";
          archiveIcon.style.float = "right";
          archiveIcon.style.marginRight = "5px";
          archiveIcon.src = archiveImage.dataset.archiveUrl; 

          archiveIcon.addEventListener("click", (event) =>{
            archive_email(email.id, email.archived);
            event.stopPropagation();
          });


          emailDiv.className = "inbox-email-item";  
          emailDiv.style.border = "1px solid #ccc";
          emailDiv.style.padding = "10px";
          emailDiv.style.marginBottom = "10px";
          emailDiv.style.cursor = "pointer";
          emailDiv.style.backgroundColor = email.read ? "#f0f0f0" : "white";
  
          emailDiv.innerHTML = `
            <strong>From :</strong> ${email.sender} <br>
            <strong>Subject:</strong> ${email.subject} <br>
            <small>${email.timestamp}</small>
          `;
  
          emailDiv.addEventListener("click", () => {
            load_email(email.id); 
          });

          emailDiv.appendChild(archiveIcon);
          view.appendChild(emailDiv);
        });
      });
  } 

  //----------------------SENT EMAILS-------------------
  else if(mailbox === "sent") {
    fetch('/emails/sent')
    .then(response => response.json())
    .then(emails =>{
      view.innerHTML = `<h3>${mailbox_name}</h3>`

      if (emails.length == 0){
        view.innerHTML += "<p>no email has been sent yet.</p>";
        return;
      }

      emails.forEach(email => {
        const emailDiv = document.createElement("div");
        emailDiv.className = "sent-email-item";
        emailDiv.style.border = "1px solid #ccc"
        emailDiv.style.padding = "10px";
        emailDiv.style.marginBottom = "10px";
        emailDiv.style.cursor = "pointer";
        emailDiv.style.backgroundColor = email.read ? "#f0f0f0" : "white";

        let email_recipients = '';
        let i = (email.recipients.length).valueOf() - 1;
        email.recipients.forEach(recipient =>{
          if(i >= 1){
            email_recipients += recipient+", ";
            
          }
          else{
            email_recipients += recipient;
          }
          i--;
        });

        const more_than_one_recipient = email.recipients.length > 1;
        const recipient_numbers = document.createElement("small");
        if (more_than_one_recipient){
          recipient_numbers.style.color = "gray";
          recipient_numbers.innerHTML = `${email.recipients.length}`;
        }
        else{
          recipient_numbers.style.display = "none";
        }

        emailDiv.innerHTML = `
          <strong>To :</strong> ${email_recipients} 
        `;

        // اضافه کردن recipient_numbers که یک div هست
        emailDiv.appendChild(recipient_numbers);

        // ادامه‌ی متن
        emailDiv.innerHTML += `
          <br>
          <strong>Subject :</strong> ${email.subject} <br>
          <small>${email.timestamp}</small>
        `;

        emailDiv.addEventListener("click", () => {
            load_email(email.id); 
        });

        view.appendChild(emailDiv);
      });
    });
  }
  //----------------------ARCHIVE EMAILS-------------------
  else if (mailbox === "archive"){
    fetch("/emails/archive")
    .then(response => response.json())
    .then(emails => {
      view.innerHTML = `<h3> ${mailbox_name} </h3>`
      if(emails.length == 0){
        view.innerHTML += "<p>no email has been Archived yet.</p>"
        return;
      }

      emails.forEach(email => {
        const emailDiv = document.createElement("div");
        const archiveIcon = document.createElement("img");
        const archiveImage = document.querySelector("#archiveImage");

        archiveIcon.className = "inbox-archive-icon";
        archiveIcon.style.width = "20px";
        archiveIcon.style.float = "right";
        archiveIcon.style.marginRight = "5px";
        archiveIcon.src = archiveImage.dataset.archiveUrl; 

        archiveIcon.addEventListener("click", (event) =>{
          archive_email(email.id, email.archived);
          event.stopPropagation(); 
        });


        emailDiv.className = "archive-email-item";
        emailDiv.style.border = "1px solid #ccc"
        emailDiv.style.padding = "10px";
        emailDiv.style.marginBottom = "10px";
        emailDiv.style.cursor = "pointer";
        emailDiv.style.backgroundColor = email.read ? "#f0f0f0" : "white";
        
        emailDiv.innerHTML = `
          <Strong>From :</Strong> ${email.sender} <br>
          <strong>Subject :</strong> ${email.subject} <br>
          <small>${email.timestamp}</small>
        `;

        emailDiv.addEventListener("click", () => {
            load_email(email.id); 
        });

        emailDiv.appendChild(archiveIcon);
        view.appendChild(emailDiv);
      });


    });
  }
  
}