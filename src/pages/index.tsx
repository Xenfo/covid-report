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
import ReadMoreDialog from '../components/ReadMoreDialog';
import StatsDialog from '../components/StatsDialog';
import { ISchool } from '../typings';

const Home: NextPage = () => {
  const [caseId, setCaseId] = useState('');
  const [visitorId, setVisitorId] = useState('');
  const [isOpenCase, setIsOpenCase] = useState(false);
  const [isOpenMore, setIsOpenMore] = useState(false);
  const [isOpenStats, setIsOpenStats] = useState(false);
  const [schools, setSchools] = useState<ISchool[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<ISchool>({
    name: 'Select a school',
    alias: '',
    classroomRegex: '',
    min: 0
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
        <div className="flex h-screen items-center justify-center">
          <Formik
            validateOnChange
            initialValues={{ caseIdOrRoomNumber: '' }}
            validationSchema={() =>
              Yup.lazy(() => {
                return Yup.object().shape({
                  caseIdOrRoomNumber: Yup.string()
                    .required('Case ID or classroom number is required')
                    .min(
                      selectedSchool.min,
                      'Must be a valid case ID or classroom number'
                    )
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
                <Form className="mb-4 w-4/5 pt-6 pb-8 md:w-2/5">
                  <p className="text-lg font-bold text-gray-900">
                    Covid-19 Tracker for Schools
                  </p>

                  <div className="text-md mb-2 text-gray-700">
                    <p>
                      This website allows EMSB parents to self-report their
                      child&apos;s positive Covid-19 result and track cases at
                      their school.
                    </p>
                    <p className="mt-2">
                      Please report your child&apos;s positive result in the
                      field below. <b>Reporting is anonymous and voluntary.</b>{' '}
                      Please only submit reports for your own child. If you have
                      a case ID and your child tests positive again after 5
                      days, report the case using the case ID.{' '}
                      <button
                        className="font-normal text-blue-600 underline underline-offset-4"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsOpenMore(true);
                        }}
                      >
                        Read More
                      </button>
                    </p>
                    <p className="mt-2">
                      <b>Disclaimer:</b> This tool is not affiliated with, nor
                      endorsed by, the English Montreal School Board.
                    </p>
                  </div>

                  <Listbox value={selectedSchool} onChange={setSelectedSchool}>
                    <div className="relative mt-1">
                      <Listbox.Button className="focus:shadow-outline relative w-full cursor-default appearance-none rounded border bg-white py-2 pl-3 pr-10 text-left shadow focus:outline-none">
                        <span className="block truncate font-normal text-gray-700">
                          {selectedSchool.name}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <SelectorIcon
                            className="h-5 w-5 text-gray-400"
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
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 scrollbar scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-700 focus:outline-none">
                          {schools.map((school, i) => (
                            <Listbox.Option
                              key={i}
                              className={({ active }) =>
                                `${
                                  active
                                    ? 'bg-blue-100 text-blue-900'
                                    : 'text-gray-700'
                                } relative cursor-default select-none py-2 pl-10 pr-4`
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
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                      <CheckIcon
                                        className="h-6 w-6"
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
                    className="focus:shadow-outline mt-2 w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
                    placeholder="Case ID or Classroom Number"
                    name="caseIdOrRoomNumber"
                    id="caseIdOrRoomNumber"
                    type="text"
                  />
                  {errors.caseIdOrRoomNumber && touched.caseIdOrRoomNumber ? (
                    <p className="-mb-1 text-red-600 md:mb-2">
                      {errors.caseIdOrRoomNumber}
                    </p>
                  ) : null}
                  <div className="mt-3 flex w-full flex-col items-center space-y-1">
                    <button
                      className="focus:shadow-outline w-full rounded bg-gray-900 py-2 px-4 font-bold text-white hover:bg-gray-800 focus:outline-none disabled:bg-gray-800"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex flex-row justify-center">
                          <div className="mr-1 inline-flex items-center">
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
                      className="focus:shadow-outline w-full rounded bg-gray-900 py-2 px-4 font-bold text-white hover:bg-gray-800 focus:outline-none"
                      type="button"
                      onClick={() => setIsOpenStats(true)}
                    >
                      Stats
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="mt-1 text-gray-700 md:mt-2">
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

                <ReadMoreDialog isOpen={isOpenMore} setIsOpen={setIsOpenMore} />
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
