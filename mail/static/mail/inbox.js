document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(recipient = "", subject = "", body = "") {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector("#email-content").style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = recipient;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body;

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

function load_email(email_id, sentMailbox=false){
  
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
    const replyButton = document.createElement("button");
    const emailBody = document.createElement("textarea");

    emailDiv.className = "email-item-content";
    emailDiv.style.border = "1px solid #ccc";
    emailDiv.style.padding = "10px";
    emailDiv.style.marginBottom = "10px";
    emailDiv.style.backgroundColor = email.read ? "#f0f0f0" : "white";

    replyButton.className = "btn btn-primary";
    replyButton.type = "button";
    replyButton.innerText = "reply";
    replyButton.style.float = "right";
    replyButton.style.display = "inline-block";
    replyButton.style.marginTop = "-10px";

    emailBody.className = "form-control";
    emailBody.style.border = "none";
    emailBody.style.padding = "0";
    emailBody.style.backgroundColor = email.read ? "#f0f0f0" : "white";
    emailBody.innerHTML = email.body;
    emailBody.style.overflow = "hidden";
    emailBody.disabled = true;
    emailBody.style.resize = "none";
    emailBody.style.height = "auto"; 
    emailBody.style.height = emailBody.scrollHeight + "px"; 
    emailBody.style.minHeight = "100px";

    replyButton.addEventListener('click',()=>{
      const subject = email.subject.startsWith("Re:") ? email.subject : "Re: " + email.subject;
      const body = `\n\nOn ${email.timestamp}, ${email.sender} wrote:\n${email.body}`;
      compose_email(email.sender, subject, body);
    });

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
      <strong>Subject:</strong> ${email.subject} <br>`;
    emailDiv.appendChild(emailBody);
    emailDiv.innerHTML += `<br><small>${email.timestamp}</small>`;
    if(!sentMailbox){
      emailDiv.appendChild(replyButton);
    }
    view.appendChild(emailDiv);
  }).then(()=>{
    // show the email content and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector("#email-content").style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
  });
}

function archive_email(email_id, email_archived){
  fetch(`emails/${email_id}`, {
    method : "PUT",
    body : JSON.stringify({
      archived : !(email_archived)
    })
  }).then(()=>{
    load_mailbox("inbox");
  });

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
  

        emails.forEach(email => {
          const emailDiv = document.createElement("div");
          const archiveIcon = document.createElement("i");

          archiveIcon.className = "fa-regular fa-star fa-lg";
          archiveIcon.id = "not-archive-star"
          archiveIcon.style.float = "right";
          archiveIcon.style.marginRight = "5px";
          // archiveIcon.src = archiveImage.dataset.archiveUrl; //getting dataset should be camelCase

          archiveIcon.addEventListener("click", (event) =>{
            archive_email(email.id, email.archived);
            event.stopPropagation();
          });


          emailDiv.className = "email-item";  
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
        emailDiv.className = "email-item";
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
            load_email(email.id, true); 
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
        const archiveIcon = document.createElement("i");
        
        archiveIcon.className = "fa-solid fa-star fa-lg";
        archiveIcon.id = "archive-star"
        archiveIcon.style.float = "right";
        archiveIcon.style.marginRight = "5px";
        // archiveIcon.src = archiveImage.dataset.archiveUrl; 

        archiveIcon.addEventListener("click", (event) =>{
          archive_email(email.id, email.archived)
          event.stopPropagation();
        });


        emailDiv.className = "email-item";
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