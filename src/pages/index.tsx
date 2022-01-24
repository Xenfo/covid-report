import FingerprintJS from '@fingerprintjs/fingerprintjs-pro';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/outline';
import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Fragment, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SpinnerCircular } from 'spinners-react';
import * as Yup from 'yup';

import CaseIDDialog from '../components/CaseIDDialog';
import StatsDialog from '../components/StatsDialog';
import { ISchool } from '../typings';

const Home: NextPage = () => {
  const [caseId, setCaseId] = useState('');
  const [visitorId, setVisitorId] = useState('');
  const [isOpenCase, setIsOpenCase] = useState(false);
  const [isOpenStats, setIsOpenStats] = useState(false);
  const [schools, setSchools] = useState<ISchool[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<ISchool>({
    name: 'Select a school',
    alias: '',
    classroomRegex: ''
  });

  useEffect(() => {
    const init = async () => {
      const schools = await axios
        .get<ISchool[]>('/data/schools.json')
        .then((res) => res.data);

      setSchools(schools);
      setSelectedSchool(schools[0]);

      await FingerprintJS.load({
        token: process.env.NEXT_PUBLIC_FINGERPRINT_KEY!,
        endpoint: 'https://fp.xenfo.dev'
      })
        .then((fp) => fp.get())
        .then((result) => {
          setVisitorId(result.visitorId);
        });
    };

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            validationSchema={() =>
              Yup.lazy(() => {
                return Yup.object().shape({
                  caseIdOrRoomNumber: Yup.string()
                    .required('Case ID or classroom number is required')
                    .min(3, 'Must be a valid case ID or classroom number')
                    .max(25, 'Must be a valid case ID or classroom number')
                    .matches(
                      new RegExp(
                        `(^#[a-z0-9]{24}$)|${selectedSchool.classroomRegex}`
                      ),
                      'Must be a valid case ID or classroom number'
                    )
                });
              })
            }
            onSubmit={async ({ caseIdOrRoomNumber }) => {
              setIsOpenCase(true);

              const pdcCase = await axios
                .post<{ caseId: string; message: string }>(
                  '/api/cases',
                  {
                    visitorId,
                    caseIdOrRoomNumber,
                    school: selectedSchool.alias
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

              if (pdcCase.data.caseId === '') {
                setIsOpenCase(false);
                return toast.success(
                  `Renewed case with ID ${caseIdOrRoomNumber}`
                );
              }

              return setCaseId(pdcCase.data.caseId);
            }}
          >
            {({ errors, touched, isSubmitting }) => (
              <>
                <Form className="pt-6 pb-8 mb-4 w-4/5 md:w-2/5">
                  <p className="text-gray-900 text-lg font-bold">
                    Covid-19 Tracker for Schools
                  </p>
                  <p className="mb-2 text-md text-gray-700">
                    The Quebec government is currently not allowing school
                    administrators to notify parents and guardians of Covid-19
                    cases at school. This website is a tool for EMSB parents to
                    self-report whether their child tested positive for Covid-19
                    and to allow parents to track the number of cases at their
                    child&apos;s school.
                    <br />
                    <p className="mt-2">
                      If your child tested positive for Covid-19, please report
                      it in the field below.{' '}
                      <b>Reporting is anonymous and voluntary.</b> Please only
                      submit reports for your own child. Cases are assumed to be
                      resolved after 5 days. However, if you already have a case
                      ID and your child tests positive again after 5 days,
                      report the case using the case ID.
                    </p>
                    <p className="mt-2">
                      We are counting on your honesty in submitting cases,
                      because we have no means to validate whether a case is
                      real. The tool imposes a limit to the number of cases than
                      can be entered over a 10-day period.
                    </p>
                    <p className="mt-2">
                      If you wish to have your school added to the tracker,
                      please send an email to:{' '}
                      <a
                        href="mailto:covid-report@xenfo.dev"
                        className="text-blue-600 underline underline-offset-4"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        covid-report@xenfo.dev
                      </a>
                      .
                    </p>
                    <p className="mt-2">
                      <b>Disclaimer:</b> This tool is not affiliated with, nor
                      endorsed by, the English Montreal School Board. This tool
                      was developed for parents, at the request of parents.
                    </p>
                  </p>
                  <Listbox value={selectedSchool} onChange={setSelectedSchool}>
                    <div className="relative mt-1">
                      <Listbox.Button className="shadow appearance-none border relative w-full py-2 pl-3 pr-10 text-left bg-white rounded cursor-default focus:outline-none focus:shadow-outline">
                        <span className="block truncate text-gray-700 font-normal">
                          {selectedSchool.name}
                        </span>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <SelectorIcon
                            className="w-5 h-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {schools.map((school, i) => (
                            <Listbox.Option
                              key={i}
                              className={({ active }) =>
                                `${
                                  active
                                    ? 'text-blue-900 bg-blue-100'
                                    : 'text-gray-700'
                                } cursor-default select-none relative py-2 pl-10 pr-4`
                              }
                              value={school}
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={`${
                                      selected ? 'font-medium' : 'font-normal'
                                    } block truncate`}
                                  >
                                    {school.name}
                                  </span>
                                  {selected ? (
                                    <span className="text-blue-600 absolute inset-y-0 left-0 flex items-center pl-3">
                                      <CheckIcon
                                        className="w-6 h-6"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                  <Field
                    className="mt-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                        href="https://xenfo.dev"
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
