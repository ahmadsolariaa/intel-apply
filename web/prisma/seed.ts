import {PrismaClient} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const INSTITUTIONS = [
  {name: "Arden University Germany", region: "Europe", country: "Germany"},
  {name: "Berlin School of Business and Innovation", region: "Europe", country: "Germany"},
  {name: "École Supérieure de Design", region: "Europe", country: "France"},
  {name: "École Supérieure de Tourisme", region: "Europe", country: "France"},
  {name: "George Brown Polytechnic", region: "North America", country: "Canada"},
  {name: "Gisma University of Applied Sciences", region: "Europe", country: "Germany"},
  {name: "Hartpury University", region: "Europe", country: "United Kingdom"},
  {name: "Quallege group of US Universities", region: "North America", country: "United States"},
  {name: "SCBS - South Champagne Business", region: "Europe", country: "France"},
  {name: "The University of Law", region: "Europe", country: "United Kingdom"},
  {name: "Trebas Institute", region: "North America", country: "Canada"},
  {name: "University Canada West", region: "North America", country: "Canada"},
  {name: "Arden University", region: "Europe", country: "United Kingdom"},
  {name: "Avila University", region: "North America", country: "United States"},
  {name: "University of Europe", region: "Europe", country: "Germany"},
];

async function main() {
  await prisma.partnerSelection.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.applicationDocument.deleteMany();
  await prisma.applicationTask.deleteMany();
  await prisma.application.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.institution.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Poiuytrewq8!", 10);
  const user = await prisma.user.create({
    data: {
      email: "goabroad.uz@gmail.com",
      name: "Anvarjon Akchabaev",
      passwordHash,
    },
  });

  const institutions = [];
  for (const item of INSTITUTIONS) {
    institutions.push(
      await prisma.institution.create({
        data: {
          ...item,
          logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=002d72&color=fff`,
        },
      }),
    );
  }

  await prisma.partnerSelection.createMany({
    data: [
      {userId: user.id, institutionId: institutions[0].id},
      {userId: user.id, institutionId: institutions[5].id},
      {userId: user.id, institutionId: institutions[9].id},
    ],
  });

  const apps = await Promise.all([
    prisma.application.create({
      data: {
        userId: user.id,
        studentName: "Aziza Karimova",
        email: "aziza.k@example.com",
        institution: "Arden University",
        programme: "MSc Computer Science",
        intake: "Sep 2026",
        status: "Application not complete",
        progress: 100,
        notes: "Waiting for passport scan",
        visaStatus: "Pending docs",
        visaNotes: "Need biometric page scan",
        tasks: {
          create: [
            {title: "Upload passport", done: false},
            {title: "Confirm intake", done: true},
          ],
        },
      },
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        studentName: "Jasur Rakhimov",
        email: "jasur.r@example.com",
        institution: "Gisma University of Applied Sciences",
        programme: "BA Business Administration",
        intake: "Sep 2026",
        status: "Application submitted",
        progress: 72,
        visaStatus: "Not started",
        tasks: {create: [{title: "Pay application fee", done: false}]},
      },
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        studentName: "Madina Tursunova",
        email: "madina.t@example.com",
        institution: "Arden University Germany",
        programme: "MBA",
        intake: "Jan 2027",
        status: "Draft Application",
        progress: 45,
      },
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        studentName: "Bobur Aliyev",
        email: "bobur.a@example.com",
        institution: "The University of Law",
        programme: "BSc Accounting",
        intake: "Sep 2026",
        status: "Conditionally accepted",
        progress: 88,
        visaStatus: "In review",
      },
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        studentName: "Nilufar Saidova",
        email: "nilufar.s@example.com",
        institution: "University Canada West",
        programme: "BCom",
        intake: "Jan 2027",
        status: "Document Review",
        progress: 60,
      },
    }),
  ]);

  await prisma.contract.createMany({
    data: [
      {
        userId: user.id,
        institution: "Arden University",
        contractNumber: "Arden University UK 08/08/2026",
        market: "Uzbekistan",
        stage: "New Enquiry",
        signingStatus: "Contract Not Issued",
        status: "Inactive",
        businessLicense: true,
        startDate: "2026-08-08",
      },
      {
        userId: user.id,
        institution: "Berlin School of Business and Innovation",
        contractNumber: "BSBI UZ 08/08/2026",
        market: "Uzbekistan",
        stage: "Under Review",
        signingStatus: "Contract Not Issued",
        status: "Inactive",
        businessLicense: true,
        startDate: "2026-08-08",
      },
      {
        userId: user.id,
        institution: "Gisma University of Applied Sciences",
        contractNumber: "GISMA UZ 08/08/2026",
        market: "Uzbekistan",
        stage: "Contract Signing",
        signingStatus: "Pending With Agent",
        status: "Inactive",
        businessLicense: true,
        startDate: "2026-08-08",
      },
      {
        userId: user.id,
        institution: "University of Law",
        contractNumber: "ULaw UK 01/06/2026",
        market: "Uzbekistan",
        stage: "Signed Contracts",
        signingStatus: "Signed",
        status: "Active",
        businessLicense: true,
        startDate: "2026-06-01",
      },
      {
        userId: user.id,
        institution: "University of Europe",
        contractNumber: "UE Germany 02/07/2026",
        market: "Central Asia",
        stage: "Closed Enquiry",
        signingStatus: "Contract Not Issued",
        status: "Inactive",
        businessLicense: true,
        startDate: "2026-07-02",
      },
    ],
  });

  await prisma.commission.createMany({
    data: [
      {
        userId: user.id,
        caseNumber: "00712406",
        subject: "Commission - Avila University",
        institution: "Avila University",
        status: "Closed",
        intake: "SP1-25",
        amount: 1250,
      },
      {
        userId: user.id,
        caseNumber: "02725741",
        subject: "Commission - Avila University",
        institution: "Avila University",
        status: "Payment",
        intake: "FA1-25",
        amount: 1750,
      },
      {
        userId: user.id,
        caseNumber: "03110022",
        subject: "Commission - GISMA",
        institution: "Gisma University of Applied Sciences",
        status: "Statement",
        intake: "FA1-26",
        amount: 980,
      },
      {
        userId: user.id,
        caseNumber: "03118801",
        subject: "Commission - Arden",
        institution: "Arden University",
        status: "New",
        intake: "SP1-26",
        amount: 1100,
      },
      {
        userId: user.id,
        caseNumber: "03119955",
        subject: "Commission - ULaw",
        institution: "The University of Law",
        status: "Invoice",
        intake: "FA2-25",
        amount: 1500,
      },
      {
        userId: user.id,
        caseNumber: "03120010",
        subject: "Commission - UCW",
        institution: "University Canada West",
        status: "Rejected",
        intake: "SP2-25",
        amount: 0,
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        title: "New application created",
        body: `${apps[0].studentName} — ${apps[0].institution}`,
        href: `/applications/${apps[0].id}`,
      },
      {
        userId: user.id,
        title: "Partner institutes ready",
        body: "Complete your B2B partner selection",
        href: "/partners",
      },
    ],
  });

  console.log("Seed OK");
  console.log("Login: goabroad.uz@gmail.com / Poiuytrewq8!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
