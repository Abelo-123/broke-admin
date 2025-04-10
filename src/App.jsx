import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { supabase } from './supabaseClient'; // Import Supabase client

function App() {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [accordionHeight, setAccordionHeight] = useState(0);
  const [customers, setCustomers] = useState([]); // State for customer data
  const [link, setLink] = useState(''); // State for link input
  const [amount, setAmount] = useState(null);
  const [modalImage, setModalImage] = useState(null); // State for modal image
  const contentRef = useRef(null);
  const [showmodal, setShowModal] = useState(false)
  const [customerss, setCustomerss] = useState([]);

  const sentWithdrawl = async (withdrawalId, amount, customer_uid) => {
    try {
      // Step 1: Update withdrawal status
      const { data, error } = await supabase
        .from('customer-withdrawl')
        .update({ status: 'done' })
        .eq('id', withdrawalId); // UUID
  
      if (error) {
        console.error('Error updating withdrawal status:', error);
        return;
      }
  
      console.log('Withdrawal update successful:', data);
  
      // Step 2: Fetch current amount from customer table
      const { data: customerData, error: fetchError } = await supabase
        .from('customer')
        .select('amount')
        .eq('uid', customer_uid) // int8
        .single();
  
      if (fetchError) {
        console.error('Error fetching customer data:', fetchError);
        return;
      }
  
      const currentAmount = customerData.amount;
      const newAmount = currentAmount - amount;
  
      // Step 3: Update the amount
      const { error: updateError } = await supabase
        .from('customer')
        .update({ amount: newAmount })
        .eq('uid', customer_uid); // int8
  
      if (updateError) {
        console.error('Error updating customer amount:', updateError);
      } else {
        console.log('Customer amount updated to:', newAmount);
      }
  
    } catch (e) {
      console.error('Exception:', e.message);
    }
  };
  
  

  const toggleAccordion = () => {
    if (isAccordionOpen) {
      setAccordionHeight(0);
    } else {
      setAccordionHeight(contentRef.current.scrollHeight);
    }
    setIsAccordionOpen(!isAccordionOpen);
  };

  const closeModal = () => setModalImage(null); // Function to close modal

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('customer')
        .select('name, status, image, amount, ref, link, cost');
        

      if (error) {
        console.error('Error fetching customers:', error);
      } else {
        setCustomers(data);
        if (data.length > 0) {
          const target = data.find((item) => item.image.toLowerCase() === "https://bihqharjyezzxhsghell.supabase.co/storage/v1/object/public/images//user_1744203658390.png");

if (target) {
  setLink(target.link);
  setAmount(target.cost);
}

        }
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
          fetchData(); // re-fetch on updates
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    const fetchWithdrawl = async () => {
     

      const { data: withData, error } = await supabase
        .from('customer-withdrawl')
        .select('*')

      if (error) {
        console.error('Error fetching customer cost:', error);
      } else {
        setCustomerss(withData);
  
      }
    };

    fetchWithdrawl();
    const refChannel = supabase
    .channel('realtime:customer-withdrawl-ref')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'customer-withdrawl' },
      (payload) => {
          fetchWithdrawl();
        
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(refChannel);
  };
  }, []);

  return (
    <>
    {showmodal && (
        <div className="fixed inset-0 z-50 flex  items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-90 shadow-xl">
          
            <div className="flex flex-col justify-end gap-2">
              <button
                className="text-3xl bg-gray-300 text-gray-100 hover:bg-gray-400 px-1 w-12 py-1 rounded"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
             
            
              <div style={{fontSize:'13px', color:'gray'}}>Withdrawl history</div>
          
            
              <table class="min-w-full table-auto bg-white border border-gray-300 rounded-lg shadow-md">
              <thead>
  <tr className="bg-gray-200 text-gray-800">
    <th className="px-4 py-2 border-b">uid</th>
    <th className="px-4 py-2 border-b">name</th>
    <th className="px-4 py-2 border-b">amount</th>
    <th className="px-4 py-2 border-b">Action</th>
  </tr>
</thead>
<tbody>
  {customerss.map((data, index) => {
    const rowBg =
      data.status === "pending"
        ? "bg-blue-100"
        : data.status === "done"
        ? "bg-green-100"
        : "";

    return (
      <tr key={index} className={`${rowBg} text-gray-900`}>
        <td className="px-4 py-2 border-b">{data.uid}</td>
        <td className="px-4 py-2 border-b">{data.name}</td>
        <td className="px-4 py-2 border-b">{data.amount}</td>
        <td className="px-4 py-2 border-b">
        {data.status == "pending" && <button onClick={() => sentWithdrawl(data.id, data.amount, data.uid)}>Sent</button>}
        </td>
      </tr>
    );
  })}
</tbody>

        </table>

            </div>
          </div>
        </div>
      )}
      <div class="w-screen h-screen block mx-auto p-8">
        <div class="flex">
          <div class="w-auto p-4 font-mono text-2xl m-2 bg-red-100">
            Link: {link}
            <br />
            Cost: {amount} ETB Birr
          </div>
          <div class="w-auto grid ml-auto place-content-left h-auto p-3">
            <button
              class="accordion-header w-auto text-left bg-blue-500 text-white rounded-t-lg focus:outline-none"
              onClick={toggleAccordion}
            >
              <span class="text-lg font-semibold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </span>
            </button>
            <div
              class="accordion-content overflow-hidden transition-all duration-300 bg-blue-100 rounded-b-lg"
              style={{ height: `${accordionHeight}px` }}
              ref={contentRef}
            >
              <div class="p-2 flex w-auto bg-red-100">
                <input
                  type="text"
                  placeholder="Link"
                  class="py-2 px-2"
                  onChange={(e) => setLink(e.target.value)} // Add state to capture input
                />
                <button
                  class="ml-2 p-4 bg-red-200 w-auto"
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('customer')
                        .update({ link })
                        .eq('uid', 7159821786);
                        //.gt('uid', 0); // This condition will match all rows (it checks for `id > 0`, which matches all positive ids)

                      if (error) {
                        console.error('Error updating customers:', error);
                      } else {
                        alert('All rows updated successfully!');
                      }
                    } catch (err) {
                      console.error('Unexpected error:', err);
                    }
                  }}
                >
                  Update
                </button>
              </div>
              <div class="p-2 flex w-auto bg-red-100">
                <input
                  type="text"
                  placeholder="Cost"
                  class="py-2 px-2"
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button
                  class="ml-2 p-4 bg-red-200 w-auto"
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('customer')
                        .update({ cost: amount })
                        .eq('uid', 7159821786);
                        //.gt('uid', 0); // This condition will match all rows (it checks for `id > 0`, which matches all positive ids)

                      if (error) {
                        console.error('Error updating customers:', error);
                      } else {
                        alert('All rows updated successfully!');
                      }
                    } catch (err) {
                      console.error('Unexpected error:', err);
                    }
                  }}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
          <div class="w-auto grid ml-auto place-content-left h-auto p-3">
            <button
              class=" w-auto text-left bg-blue-500 text-white rounded-t-lg focus:outline-none"
                  onClick={() => setShowModal(true)}
            >
              Withdrawl
            </button>
          </div>
        </div>
        <table class="min-w-full table-auto bg-white border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr class="bg-gray-200 text-gray-800">
              <th class="px-4 py-2 border-b">#</th>
              <th class="px-4 py-2 border-b">User</th>
              <th class="px-4 py-2 border-b">Image</th>
              <th class="px-4 py-2 border-b">Action</th>
              <th class="px-4 py-2 border-b">Ref</th>
              <th class="px-4 py-2 border-b">Amount</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((data, index) => (
              <tr key={index} class="bg-gray-50">
                <td class="px-4 py-2 border-b text-center">{index + 1}</td>
                <td class="px-4 py-2 border-b">{data.name}</td>
                <td class="px-4 py-2 border-b text-center">
                  <img
                    src={data.image}
                    alt={data.name}
                    class="h-10 w-10 rounded-full cursor-pointer"
                    onClick={() => setModalImage(data.image)} // Set modal image on click
                  />
                </td>
                <td class="px-4 py-2 border-b">
                  {data.status}
               
                </td>
                <td class="px-4 py-2 border-b">{data.ref}</td>
                <td class="px-4 py-2 border-b">{data.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Modal for displaying image */}
        {modalImage && (
          <div
            class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={closeModal} // Close modal on background click
          >
            <div class="bg-white p-4 rounded-lg">
              <img src={modalImage} alt="Modal" class="max-w-full max-h-screen" />
              <button
                class="mt-2 p-2 bg-red-500 text-white rounded"
                onClick={closeModal} // Close modal on button click
              >
                Close
              </button>
              &nbsp;&nbsp;
              <button
                class="mt-2 p-2 bg-blue-500 text-white rounded"
                onClick={async () => {
                  try {
                    // Fetch the customer data for the modal image
                    const { data, error: fetchError } = await supabase
                      .from('customer')
                      .select('amount, cost, link, ref')
                      .eq('image', modalImage)
                      .single();

                      const { data: datalink, error: errorLink } = await supabase
                      .from('customer')
                      .select('link')
                      .eq('uid', 7159821786) // Ensure this is a number, not a string
                      .single();
  
                    
                      if (fetchError) {
                        console.error('Error fetching customer data:', fetchError);
                        return;
                      }

                    if (errorLink) {
                      console.error('Error fetching customer data:', errorLink);
                      return;
                    }
  
                    // Update the status and amount
                   
                    const { error: updateError } = await supabase
                      .from('customer')
                      .update({ status: 'approved', user_link:datalink.link }) // Include link in the update
                      .eq('image', modalImage);
  
                    if (updateError) {
                      console.error('Error updating customer:', updateError);
                    } else {
                      const { data: data2, error: fetchError2 } = await supabase
                        .from('customer')
                        .select('amount')
                        .eq('uid', data?.ref);
  
                      if (fetchError2 || !data2 || data2.length === 0) {
                        console.warn(`No matching customer found for the given ref ${data.ref}. Skipping amount update.`);
                        alert('No matching customer found for the given reference. Please verify the data.');
                      } else {
                        const totalAmount = data2.reduce((sum, row) => sum + row.amount, 0) + data.cost; // Calculate the total amount
                        const { error: updateError2 } = await supabase
                          .from('customer')
                          .update({ amount: totalAmount })
                          .eq('uid', data?.ref);
  
                        if (updateError2) {
                          console.error('Error updating customer amount:', updateError2);
                        } else {
                          alert(`Status updated to approved and amount updated! and amount for ref ${data.ref}`);
                          closeModal(); // Close the modal after updating
                        }
                      }
                    }
                  } catch (err) {
                    console.error('Unexpected error:', err);
                  }
                }}
              >
                Approved
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
