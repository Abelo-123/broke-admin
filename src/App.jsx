import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { supabase } from './supabaseClient'; // Import Supabase client
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS
import Swal from "sweetalert2"; // Import SweetAlert2


function App() {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [accordionHeight, setAccordionHeight] = useState(0);

  const [isAccordionOpenB, setIsAccordionOpenB] = useState(false);
  const [accordionHeightB, setAccordionHeightB] = useState(0);
  const [customers, setCustomers] = useState([]); // State for customer data
  const [link, setLink] = useState(''); // State for link input
  const [amount, setAmount] = useState(null);
  const [amounts, setAmounts] = useState(null);
  const [modalImage, setModalImage] = useState(null); // State for modal image
  const contentRef = useRef(null);
  const contentRefB = useRef(null);

  const [bankaname, setBankname] = useState(null);
  const [banknum, setBanknum] = useState(null);
  const [bankholders, setBankHolders] = useState(null);


  const [showmodal, setShowModal] = useState(false)
  const [customerss, setCustomerss] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
 

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
  
  
  useEffect(() => {
    const initialAmounts = {};
    customers.forEach(customer => {
      initialAmounts[customer.name] = customer.amount || '';  // Set initial amounts
    });
    setAmounts(initialAmounts);
  }, [customers]);



  const toggleAccordion = () => {
    if (isAccordionOpen) {
      setAccordionHeight(0);
    } else {
      setAccordionHeight(contentRef.current.scrollHeight);
    }
    setIsAccordionOpen(!isAccordionOpen);
  };


  const toggleAccordionB = () => {
    if (isAccordionOpenB) {
      setAccordionHeightB(0);
    } else {
      setAccordionHeightB(contentRefB.current.scrollHeight);
    }
    setIsAccordionOpenB(!isAccordionOpenB);
  };

  const closeModal = () => setModalImage(null); // Function to close modal

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('customer')
        .select('name, status, image, amount, ref, link, cost, uid, chat');
        

      if (error) {
        console.error('Error fetching customers:', error);
      } else {
        console.log(data)
        setCustomers(data);
        if (data.length > 0) {
          const target = data.find(
            (item) => item.image?.toLowerCase() === "https://bihqharjyezzxhsghell.supabase.co/storage/v1/object/public/images//user_1744203658390.png"
          );
          setAmount(target.cost)
          setLink(target.link)

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

  const handleAmountChange = async (customerName, newAmount) => {
    try {
      const { error } = await supabase
        .from('customer')
        .update({ amount: newAmount })
        .eq('name', customerName);
  
      if (error) {
        console.error('Error updating amount:', error);
      } else {
        console.log(`Amount updated for ${customerName}: ${newAmount}`);
        Swal.fire({
          icon: 'success',
          title: 'Updated',
          text: `Amount updated for ${customerName}.`,
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };


  useEffect(() => {
    const fetchInfoData = async () => {
     

      const {  data:dataid3, error } = await supabase
  .from('customer')
  .select('bankname, banknum, bankholder')
  .eq('uid', 7159821786)
  .single();

      if (error) {
        console.error('Error fetching customer cost:', error);
      } else {

        setBankname(dataid3.bankname);
        setBanknum(dataid3.banknum);
        setBankHolders(dataid3.bankholder);

      }
    };

    fetchInfoData();

    const costChannel = supabase
      .channel('realtime:customer-info-by-uid')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customer' },
        (payload) => {
          if (payload.new?.uid == 7159821786) {
            fetchInfoData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(costChannel);
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
          
          <div class="overflow-y-auto h-96">  
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
        </div>
      )}
      <div class="w-screen h-screen block mx-auto p-2">
        <div class="flex flex-col">
          <div class="w-auto p-4 font-mono text-1xl m-2 ">
            Link: {link}
            <br />
            Cost: {amount} ETB Birr
          </div>
          <div class=" w-auto grid mr-auto place-content-left h-auto p-3">
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
              class="accordion-content overflow-y-hidden transition-all duration-300  rounded-b-lg"
              style={{ height: `${accordionHeight}px` }}
              ref={contentRef}
            >
              <div class="p-2 flex w-auto ">
                <input
                  type="text"
                  placeholder="Link"
                  class="py-1 px-2 text-gray-900   bg-gray-200"
                  onChange={(e) => setLink(e.target.value)} // Add state to capture input
                />
                <button
                  class="ml-2 p-2  bg-gray-600 w-auto"
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
                        alert('success!');
                      }
                    } catch (err) {
                      console.error('Unexpected error:', err);
                    }
                  }}
                >
                  Update
                </button>
              </div>
              <div class="p-2 flex w-auto ">
                <input
                  type="text"
                  placeholder="Cost"
                  class="py-1 px-2   bg-gray-200"
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button
                  class="ml-2 p-2  bg-gray-600 w-auto"
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
                        alert('success!');
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

<br/>

            <button
              class="accordion-header w-auto text-left bg-blue-500 text-white rounded-t-lg focus:outline-none"
              onClick={toggleAccordionB}
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
              class="accordion-content overflow-y-hidden transition-all duration-300  rounded-b-lg"
              style={{ height: `${accordionHeightB}px` }}
              ref={contentRefB}
            >
              <div class="p-2 flex w-auto ">
               <div class="m-auto">Bank Name </div> <input
                  type="text"
                  value={bankaname}
                  placeholder="BankName"
                  class="py-1 px-2 text-gray-900   bg-gray-200"
                  onChange={(e) => setBankname(e.target.value)} // Add state to capture input
                />
                <button
                  class="ml-2 p-2  bg-gray-600 w-auto"
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('customer')
                        .update({ bankname: bankaname })
                        .eq('uid', 7159821786);
                        //.gt('uid', 0); // This condition will match all rows (it checks for `id > 0`, which matches all positive ids)

                      if (error) {
                        console.error('Error updating customers:', error);
                      } else {
                        alert('success');
                      }
                    } catch (err) {
                      console.error('Unexpected error:', err);
                    }
                  }}
                >
                  Update
                </button>
              </div>
              <div class="p-2 flex w-auto ">
              <div class="m-auto">Account Number </div>
              <input
                  type="text"
                  placeholder="banknumber"
                  value={banknum}
                  class="py-1 px-2 text-gray-900   bg-gray-200"
                  onChange={(e) => setBanknum(e.target.value)} // Add state to capture input
                />
                <button
                  class="ml-2 p-2  bg-gray-600 w-auto"
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('customer')
                        .update({ banknum: banknum })
                        .eq('uid', 7159821786);
                        //.gt('uid', 0); // This condition will match all rows (it checks for `id > 0`, which matches all positive ids)

                      if (error) {
                        console.error('Error updating customers:', error);
                      } else {
                        alert('success!');
                      }
                    } catch (err) {
                      console.error('Unexpected error:', err);
                    }
                  }}
                >
                  Update
                </button>
              </div>
              <div class="p-2 flex w-auto ">
              <div class="m-auto">Account Holder </div>
              <input
                  type="text"
                  placeholder="bankholder"
                  value={bankholders}
                  class="py-1 px-2 text-gray-900   bg-gray-200"
                  onChange={(e) => setBankHolders(e.target.value)} // Add state to capture input
                />
                <button
                  class="ml-2 p-2  bg-gray-600 w-auto"
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('customer')
                        .update({ bankholder: bankholders })
                        .eq('uid', 7159821786);
                        //.gt('uid', 0); // This condition will match all rows (it checks for `id > 0`, which matches all positive ids)

                      if (error) {
                        console.error('Error updating customers:', error);
                      } else {
                        alert('success!');
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
        <div style={{ height: '35rem' }} class="w-11/12 mx-auto p-2 scrollabler overflow-scroll">
          <input
            type="text"
            placeholder="Search by name"
            class="mb-4 p-2 border rounded w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Update search term
          />
          <table class="min-w-full table-auto bg-white border border-gray-300 rounded-lg shadow-md">
            <thead>
              <tr class="bg-gray-200 text-gray-800">
                <th class="px-4 py-2 border-b">#</th>
                <th class="px-4 py-2 border-b">User</th>
                <th class="px-4 py-2 border-b">Image</th>
                <th class="px-4 py-2 border-b">Status</th>
                <th class="px-4 py-2 border-b">Refer</th>
                <th class="px-4 py-2 border-b">Balance</th>
                <th class="px-4 py-2 border-b">Chat</th>
              </tr>
            </thead>
            <tbody>
              {customers
                .filter((data) => data.name.toLowerCase().includes(searchTerm.toLowerCase())) // Filter by name
                .map((data, index) => {
                  const customerIndex = customers.findIndex((customer) => customer.name === data.name); // Find the correct index in the original array
                  return (
                    <tr key={index} class="text-gray-600 bg-gray-50">
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
                      <td style={{cursor: 'pointer'}} class="px-4 py-2 border-b">{data.status}</td>
                      <td class="px-4 py-2 border-b">{data.ref}</td>
                      <td class="px-4 flex py-2 border-b">
                        <input
                          type="number"
                          value={data.amount} // Set input value to current amount
                          onChange={(e) => {
                            const updatedCustomers = [...customers];
                            updatedCustomers[customerIndex].amount = e.target.value; // Update the correct customer
                            setCustomers(updatedCustomers);
                          }} // Update the local state on input change
                          className="border px-2 py-1"
                        />
                        <button
                          onClick={() => handleAmountChange(data.name, customers[customerIndex].amount)} // Pass the updated value
                          className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                          Update
                        </button>
                      </td>
                      <td class="px-4 py-2 border-b">
                        <a href={`https://t.me/${data.chat}`} target="_blank" rel="noopener noreferrer">
                          <i className="fab fa-telegram-plane text-blue-500 text-xl"></i>
                        </a>
                      </td>
                      <td class="px-4 py-2 border-b">
                        <a
                          style={{cursor: 'pointer'}}
                          onClick={async () => {
                            if (data.ref == 1) {
                              const { data: oldData, error: fetchError } = await supabase
                                .from('customer')
                                .select('replace')
                                .eq('uid', data.uid)
                                .single();

                              if (fetchError) {
                                console.error("Failed to fetch unbanned status:", fetchError);
                              } else if (oldData) {
                                const { error: updateError } = await supabase
                                  .from('customer')
                                  .update({ ref: oldData.replace })
                                  .eq('uid', data.uid);

                                if (updateError) {
                                  console.error("Failed to update unbanned status:", updateError);
                                } else {
                                  Swal.fire({
                                    icon: "success",
                                    title: "Unbanned",
                                    text: "Account unbanned.",
                                  });
                                }
                              }
                            } else {
                              const { data: oldData, error: fetchError } = await supabase
                                .from('customer')
                                .select('ref')
                                .eq('uid', data.uid)
                                .single();

                              if (fetchError) {
                                console.error("Failed to fetch banned status:", fetchError);
                              } else if (oldData && oldData.ref) {
                                const { error: updateError } = await supabase
                                  .from('customer')
                                  .update({ ref: 1, replace: oldData.ref })
                                  .eq('uid', data.uid);

                                if (updateError) {
                                  console.error("Failed to update banned status:", updateError);
                                } else {
                                  Swal.fire({
                                    icon: "success",
                                    title: "Banned",
                                    text: "Account banned.",
                                  });
                                }
                              }
                            }
                          }}
                        >
                          {data.ref == 1 ? "Unbanned" : "Ban"}
                        </a>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {/* Modal for displaying image */}
        {modalImage && (
          <div
            class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={closeModal} // Close modal on background click
          >
            <div class="bg-white p-4 rounded-lg">
              <img src={modalImage} style={{maxHeight:'35rem'}} alt="Modal" class="max-w-full " />
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
                      .select('link, cost')
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
                      alert('success!');
                    } else {
                     
                      const updatedAmount = (data2[0]?.amount || 0) + datalink.cost;


                      const { error: updateError2 } = await supabase
                        .from('customer')
                        .update({ amount: updatedAmount})
                        .eq('uid', data?.ref);

                        if (updateError2) {
                          console.error('Error updating customer amount:', updateError2);
                        } else {
                          alert("success")
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
              &nbsp;&nbsp;
              <button
                class="mt-2 p-2 bg-blue-500 text-white rounded"
                onClick={async () => {
                  try {
                    // Fetch the customer data for the modal image
                    const { error: updateError } = await supabase
                    .from('customer')
                    .update({ status: 'cancel'}) // Include link in the update
                    .eq('image', modalImage);

                  if (updateError) {
                    console.error('Error updating customer:', updateError);
                  } else {
                    closeModal();
                  }
                  } catch (err) {
                    console.error('Unexpected error:', err);
                  }
                }}
              >
                Cancelled
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
