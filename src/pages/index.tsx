import FingerprintJS from '@fingerprintjs/fingerprintjs-pro';
import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SpinnerCircular } from 'spinners-react';

import CaseIDDialog from '../components/CaseIDDialog';
import StatsDialog from '../components/StatsDialog';
import CaseSchema from '../schemas/CaseSchema';

const Home: NextPage = () => {
  const [caseId, setCaseId] = useState('');
  const [visitorId, setVisitorId] = useState('');
  const [isOpenCase, setIsOpenCase] = useState(false);
  const [isOpenStats, setIsOpenStats] = useState(false);

  useEffect(() => {
    void FingerprintJS.load({
      token: process.env.NEXT_PUBLIC_FINGERPRINT_KEY!,
      endpoint: 'https://fp.xenfo.dev'
    })
      .then((fp) => fp.get())
      .then((result) => {
        setVisitorId(result.visitorId);
      });
  }, []);

  return (
    <div>
      <Head>
        <title>Covid Report</title>
        <meta
          name="description"
          content="Report Covid cases in the EMSB school system"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="flex justify-center items-center h-screen">
          <Formik
            validateOnChange
            initialValues={{ caseIdOrRoomNumber: '' }}
            validationSchema={CaseSchema}
            onSubmit={async ({ caseIdOrRoomNumber }) => {
              setIsOpenCase(true);

              const pdcCase = await axios
                .post<{ caseId: string; message: string }>(
                  '/api/cases',
                  {
                    visitorId,
                    caseIdOrRoomNumber
                  },
                  { validateStatus: (status) => status >= 200 && status < 500 }
                )
                .catch(() => {
                  setIsOpenCase(false);
                  toast.error('Failed to create case');
                  return null;
                });

              if (!pdcCase) return;

              if (pdcCase.status !== 200) {
                setIsOpenCase(false);
                return toast.error(pdcCase.data.message);
              }

              return setCaseId(pdcCase.data.caseId);
            }}
          >
            {({ errors, touched, isSubmitting }) => (
              <>
                <Form className="pt-6 pb-8 mb-4 w-4/5 md:w-2/5">
                  <p className="text-gray-900 text-lg font-bold">
                    Covid Report
                  </p>
                  <p className="mb-2 text-md text-gray-700">
                    If your child tested positive for Covid-19, please report it
                    in the field below. Reporting is anonymous and voluntary.
                    Please only submit reports for your child. If you already
                    have a case ID and your child tests positive after 5 days,
                    resubmit the case ID.
                  </p>
                  <Field
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Case ID or Classroom Number"
                    name="caseIdOrRoomNumber"
                    id="caseIdOrRoomNumber"
                    type="text"
                  />
                  {errors.caseIdOrRoomNumber && touched.caseIdOrRoomNumber ? (
                    <p className="text-red-600 -mb-1 md:mb-2">
                      {errors.caseIdOrRoomNumber}
                    </p>
                  ) : null}
                  <div className="flex flex-col w-full items-center mt-3 space-y-1">
                    <button
                      className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-800 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex flex-row justify-center">
                          <div className="inline-flex items-center mr-1">
                            <SpinnerCircular
                              className="inline-block"
                              size={15}
                              thickness={180}
                              color="#2563EB"
                              secondaryColor="#fff"
                            />
                          </div>
                          <span>Submitting</span>
                        </div>
                      ) : (
                        'Submit'
                      )}
                    </button>
                    <button
                      className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline"
                      type="button"
                      onClick={() => setIsOpenStats(true)}
                    >
                      Stats
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="mt-1 md:mt-2 text-gray-700">
                      &copy; Made by{' '}
                      <a
                        href="https://github.com/Xenfo"
                        className="text-blue-600 underline underline-offset-4"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Samuel Corsi-House
                      </a>
                    </p>
                  </div>
                </Form>

                <CaseIDDialog
                  isSubmitting={isSubmitting}
                  caseId={caseId}
                  setCaseId={setCaseId}
                  isOpen={isOpenCase}
                  setIsOpen={setIsOpenCase}
                />
                <StatsDialog isOpen={isOpenStats} setIsOpen={setIsOpenStats} />
              </>
            )}
          </Formik>
        </div>
      </main>
    </div>
  );
};

export default Home;
