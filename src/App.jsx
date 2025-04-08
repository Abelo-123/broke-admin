import React, { useState, useEffect } from 'react';
import './index.css';
import { supabase } from './supabaseClient'; // Import Supabase client
import Swal from "sweetalert2"; // Import SweetAlert2

function App() {
  const [image, setImage] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingb, setLoadingB] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [id, setId] = useState(1234);
  const [customers, setCustomers] = useState([]);

  const [imageUrl, setImageUrl] = useState(null); // To store the image URL from the customer table
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = () => {
    const input = document.getElementById("yourInputId"); // Replace with your actual input's ID
    if (input) {
      navigator.clipboard.writeText(input.value).then(() => {
        Swal.fire({
          icon: "success",
          title: "Copied",
          text: "Copied to clipboard.",
        });
      }).catch((err) => {
        console.error("Clipboard copy failed:", err);
      });
    }
  };

  const handleImageUpload = async () => {
    setLoadingB(true)
    if (!image) {
      Swal.fire({
        icon: "warning",
        title: "No Image",
        text: "Please select an image first.",
      });
      return;
    }
  
    try {
      const fileName = `user_${Date.now()}.png`; // Unffique file name
      const { data, error: uploadError } = await supabase.storage
        .from('images') // Replቭace 'images' with your Supabase storage bucket name
        .upload(fileName, dataURLtoBlob(image), {
          contentType: 'image/png',
        });
  
      if (uploadError) {
        throw uploadError;
      }
  
 
  
      const { error: dbError } = await supabase
        .from('customer')
        .update({ image: `https://bihqharjyezzxhsghell.supabase.co/storage/v1/object/public/images//${fileName}` })
        .eq('uid', id); // Upddate the recድorድd for the current user
  
      if (dbError) {
        throw dbError;
      }
      setIsUploaded(true); // Hide the "SEND" button
      setImageUrl('publicUrl');
      Swal.fire({
        icon: "success",
        title: "Uploaded",
        text: "Image uploaded successfully.",
      })
    } catch (error) {
      setLoadingB(false);
      setImageUrl('publicUrl');
      console.error("Error uploading image:", error);
      Swal.fire({
        icon: "error",
        title: "Try Again",
        text: "Please try again.",
      })
    }  finally {
      setLoadingB(false); // Always stop loading after script completes
    }

  };
  
  const dataURLtoBlob = (dataURL) => {
    const [header, base64] = dataURL.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(base64);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: mime });
  };
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('customer')
        .select('name, status, image')
        .eq('ref', id);

      if (error) {
        console.error('Error fetching customers:', error);
      } else {
        setCustomers(data);
      }
    };

    fetchData();

    // Optional: subscribe to real-time changes
    const subscription = supabase
      .channel('realtime:customer')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customer' },
        (payload) => {
          if (payload.new.ref === id) {
            fetchData(); // re-fetch on updates
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

    useEffect(() => {
      setLoading(true); 
  
          // Load the Telegram Web App JavaScript SDK
          const script = document.createElement("script");
          script.src = "https://telegram.org/js/telegram-web-app.js?2";
          script.async = true;
          document.body.appendChild(script);
  
          script.onload = async () => {
            try {
              const Telegram = window.Telegram;
              Telegram.WebApp.expand();
              if (window.Telegram && window.Telegram.WebApp) {
                  window.Telegram.WebApp.ready();
                 
                  const { user } = Telegram.WebApp?.initDataUnsafe;
                  
                  const from = Telegram.WebApp?.initDataUnsafe?.start_param;                  
               
                  
                  const { data } = await supabase
                  .from('customer')
                  .select('image')
                  .eq('uid', user.id)
                  .single();

                  const {  data:dataid } = await supabase
                  .from('customer')
                  .select('uid')
                  .eq('uid', user.id);
                
                  

                  if (data?.image) {
                    setImageUrl(data.image);
                  }
                  const storageKey = `userdata_name_${user.id}`; // Unique key for each user (or mini-app)
  
                  const userNameFromStorage = localStorage.getItem(storageKey);
  
                  setId(user.id)
                  if (userNameFromStorage || dataid.length == 1) {
                      //setAuthMsg(`Uer ddata alredsady exists in localStorage: ${userNameFromStorage}`);
                      console.log('User data already exists in localStorage:', userNameFromStorage)
                      return; // Do not call the API idf the data is already set
                  } else {
                      // Show loading spinner
                      if (user) {
                
                          try {
  
  
                              const { error } = await supabase
                                  .from('customer')
                                  .insert([
                                      {  name: user.first_name, uid: user.id, ref: from }
                                  ]);
  
                              if (error) {
                                  console.error(error.message)
                              } 
  
                              const userName = user.id;
  
                            
                              localStorage.setItem(storageKey, userName);

                              window.location.href = `https://t.me/djdj22_bot`; 

                              
                          } catch (error) {
                              console.error("Error adding user:", error);
                          }
                      }
                  }
  
              } else {
                  console.error("Telegram Web App API not loaded");
              } // Adjust timeout as necessary
            } catch (error) {
              console.error("Error during Telegram script load:", error);
            } finally {
              setLoading(false); // Always stop loading after script completes
            }
  
          };
  
         
  
          return () => {
              
              document.body.removeChild(script);
  
          };
      }, []);


  return (
    
    <div class="relative w-screen h-screen bg-red-100 flex flex-col items-center justify-center">
    {loading && (
  <div className="w-screen grid place-content-center absolute h-screen bg-red-300" style={{ textAlign: "center", padding: "2rem" }}>
    <div className="spinner"></div>
  </div>
    )}
    {loadingb && (
  <div className="w-screen grid place-content-center absolute h-screen bg-red-300" style={{ textAlign: "center", padding: "2rem" }}>
    <div className="spinner"></div>
    <h2 className="font-mono text-2xl mt-12">Inserting Image...</h2>
  </div>
    )}
     {showModal && (
        <div className="fixed inset-0 z-50 flex  items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
          
            <div className="flex flex-col justify-end gap-2">
              <button
                className="text-3xl bg-gray-300 text-gray-100 hover:bg-gray-400 px-1 w-12 py-1 rounded"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
             
              <p className="text-sm text-gray-600 mb-4">This is your modal content.</p>
              <div class="flex relative">
              <input
                type="text"
                id="yourInputId"
                className="text-stone-500 w-full p-3 pr-10 bg-red-100 rounded-md"
                value={`tg://resolve?domain=djdj22_bot&startapp=${id}`}
                readOnly
              />
              <button
                onClick={copyToClipboard}
                className="absolute right-0 bg-red-100 hover:text-black"
                title="Copy to clipboard"
              >
                📋 Copy
              </button>
              </div>
              <div style={{fontSize:'13px', color:'gray'}}>Your Refered</div>
              <ul class="list-none list-inside text-sm text-gray-600 mb-4">
              {customers.map((customer, index) => (
                <li
                  key={index}
                  className="border-t-2 border-black pt-3 p-2"
                >
  <div
    className={`p-3 mr-2 rounded-md py-1 inline ${
      customer.status === "approved"
        ? "bg-green-200"
        : customer.image
        ? "bg-blue-200"
        : "bg-red-200"
    }`}
  >
  </div>
                    {customer.name} {" "}
 
 
                </li>
              ))}
            </ul>

            </div>
          </div>
        </div>
      )}
<div class="grid place-content-center grid-cols-2 gap-2 absolute p-3 bg-red-200 top-12 left-12"> 
<div class="p-2 bg-red-300"
  onClick={() => setShowModal(true)}
>add</div>
   <div class="m-auto">0.00</div> 
  </div>
       {<button onClick={() => {
                    localStorage.clear();

                }}>
                    Clean
                </button>}<br />
      <h2 class="underline font-mono text-xl font-bold">LOREM EpsuM</h2><br />
      <div class="w-11/12 block gap-4  grid max-h-96 p-4 bg-red-200">
      {!imageUrl && (
        <div class="w-12/12  h-56 bg-red-300 p-3 flex place-content-center grid"
         onClick={() => document.getElementById('imageInput').click()}
        >
            {image ? (
        <img src={image} alt="Selected" className="max-h-56 max-w-full object-contain" />
        ) : (
          'Your Image'
        )}
          
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
         
        </div>
         )}
        {image && (
          !isUploaded && (
        <div
        class="w-full bg-red-400 rounded-lg p-4 py-4 text-center cursor-pointer animated-button"
        onClick={handleImageUpload}
      >
        SEND
      </div>
          )
        )}
        <div class="flex gap-3">
          <input
            type="text"
            value="Link waiting..."
            id="copyInput"
            disabled
            class="w-10/12 bg-red-300 rounded-lg p-4 py-3"
          />
         <button
  style={{ background: "rgba(0, 0, 0, 0.1)" }}
  class="px-4 d-inline m-auto flex items-center gap-2"
  onClick={() => {
    const input = document.getElementById("copyInput");
    const url = input.value.trim(); // Get the URL from the input field

    if (url && url.startsWith("http")) {
      window.open(url, "_blank"); // Open in a new tab
    } else {
      Swal.fire({
        icon: "warning",
        title: "Invalid",
        text: "Insert the image first.",
      }); // Alert ifss the input dsoesn't contadidn a valid link
    }
  }}
>
  Visitl
</button>
        </div>
      </div>
      <i style={{fontSize:'15px'}} class="w-9/12 mt-2 text-wrap">lorem epsum dolor sit amet lorem epsum dolor sit amet lorem epsum dolor sit amet lorem epsum dolor sit amet</i>
    </div>
  )
}

export default App
